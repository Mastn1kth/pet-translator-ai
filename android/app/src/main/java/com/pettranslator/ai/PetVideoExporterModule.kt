package com.pettranslator.ai

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.CanvasOverlay
import androidx.media3.effect.OverlayEffect
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.Collections

class PetVideoExporterModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val mainHandler = Handler(Looper.getMainLooper())
  private val activeTransformers = Collections.synchronizedSet(mutableSetOf<Transformer>())

  override fun getName(): String = "PetVideoExporter"

  @ReactMethod
  fun exportMemeVideo(projectJson: String, promise: Promise) {
    mainHandler.post {
      try {
        val project = VideoProject.fromJson(JSONObject(projectJson))
        if (project.sourceUri.isBlank()) {
          promise.reject("NO_SOURCE_URI", "Video project does not include sourceUri.")
          return@post
        }

        val outputFile = File(reactContext.cacheDir, "pet-meme-${System.currentTimeMillis()}.mp4")
        if (outputFile.exists()) outputFile.delete()

        val mediaItem = MediaItem.fromUri(parseSourceUri(project.sourceUri))
        val overlay = MemeCanvasOverlay(project)
        val effects = Effects(emptyList(), listOf(OverlayEffect(listOf(overlay))))
        val editedMediaItem = EditedMediaItem.Builder(mediaItem)
          .setEffects(effects)
          .build()

        lateinit var transformer: Transformer
        val listener = object : Transformer.Listener {
          override fun onCompleted(composition: Composition, exportResult: ExportResult) {
            activeTransformers.remove(transformer)
            if (!outputFile.exists() || outputFile.length() == 0L) {
              outputFile.delete()
              promise.reject("EXPORT_EMPTY_OUTPUT", "Media3 Transformer completed without a valid MP4 output.")
              return
            }
            promise.resolve(Uri.fromFile(outputFile).toString())
          }

          override fun onError(
            composition: Composition,
            exportResult: ExportResult,
            exportException: ExportException
          ) {
            activeTransformers.remove(transformer)
            outputFile.delete()
            promise.reject(
              "MEDIA3_EXPORT_FAILED",
              exportException.message ?: "Media3 Transformer failed to export meme video.",
              exportException
            )
          }
        }

        transformer = Transformer.Builder(reactContext)
          .addListener(listener)
          .build()
        activeTransformers.add(transformer)
        transformer.start(editedMediaItem, outputFile.absolutePath)
      } catch (error: Exception) {
        promise.reject("EXPORT_FAILED", error.message ?: "Failed to export meme video.", error)
      }
    }
  }

  private fun parseSourceUri(sourceUri: String): Uri {
    val uri = Uri.parse(sourceUri)
    return when {
      uri.scheme == null || uri.scheme!!.isBlank() -> Uri.fromFile(File(sourceUri))
      else -> uri
    }
  }

  private data class CaptionCue(
    val startMs: Long,
    val endMs: Long,
    val text: String
  )

  private data class ModelObservation(
    val label: String,
    val confidence: Float,
    val top: Float?,
    val left: Float?,
    val bottom: Float?,
    val right: Float?
  )

  private data class VideoProject(
    val sourceUri: String,
    val templateId: String,
    val filterId: String,
    val captions: List<CaptionCue>,
    val observations: List<ModelObservation>
  ) {
    companion object {
      fun fromJson(json: JSONObject): VideoProject {
        return VideoProject(
          sourceUri = json.optString("sourceUri", ""),
          templateId = json.optString("templateId", "attention"),
          filterId = json.optString("filterId", "none"),
          captions = parseCaptions(json.optJSONArray("captions")),
          observations = parseObservations(json.optJSONArray("modelObservations"))
        )
      }

      private fun parseCaptions(array: JSONArray?): List<CaptionCue> {
        if (array == null) return emptyList()
        return (0 until array.length()).mapNotNull { index ->
          val item = array.optJSONObject(index) ?: return@mapNotNull null
          val text = item.optString("text", "").trim()
          if (text.isBlank()) return@mapNotNull null
          CaptionCue(
            startMs = item.optLong("startMs", 0L),
            endMs = item.optLong("endMs", 0L),
            text = text
          )
        }
      }

      private fun parseObservations(array: JSONArray?): List<ModelObservation> {
        if (array == null) return emptyList()
        return (0 until array.length()).mapNotNull { index ->
          val item = array.optJSONObject(index) ?: return@mapNotNull null
          val label = item.optString("label", "unknown")
          if (label != "cat" && label != "dog") return@mapNotNull null
          val bbox = item.optJSONObject("bbox")
          ModelObservation(
            label = label,
            confidence = item.optDouble("confidence", 0.0).toFloat(),
            top = bbox?.optDouble("top")?.toFloat(),
            left = bbox?.optDouble("left")?.toFloat(),
            bottom = bbox?.optDouble("bottom")?.toFloat(),
            right = bbox?.optDouble("right")?.toFloat()
          )
        }
      }
    }
  }

  @OptIn(UnstableApi::class)
  private class MemeCanvasOverlay(private val project: VideoProject) : CanvasOverlay(true) {
    private val textPaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      textAlign = Paint.Align.LEFT
      typeface = android.graphics.Typeface.DEFAULT_BOLD
    }
    private val shapePaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeCap = Paint.Cap.ROUND
      strokeJoin = Paint.Join.ROUND
    }

    override fun onDraw(canvas: Canvas, presentationTimeUs: Long) {
      val timeMs = presentationTimeUs / 1000L
      val width = canvas.width.toFloat()
      val height = canvas.height.toFloat()

      drawTemplateBadge(canvas, width)
      drawFilter(canvas, width, height)
      drawBestModelObservation(canvas, width, height)

      val activeCaptions = project.captions.filter { cue ->
        timeMs >= cue.startMs && (cue.endMs <= cue.startMs || timeMs <= cue.endMs)
      }
      activeCaptions.take(2).forEachIndexed { index, cue ->
        drawCaptionBox(
          canvas = canvas,
          text = cue.text,
          centerX = width / 2f,
          bottomY = height - 44f - index * 118f,
          maxWidth = (width * 0.86f).toInt(),
          textSize = (width * 0.055f).coerceIn(28f, 54f)
        )
      }
    }

    private fun drawTemplateBadge(canvas: Canvas, width: Float) {
      val text = "TEMPLATE ${project.templateId.uppercase()}"
      drawPill(canvas, 28f, 28f, text, Color.argb(190, 0, 0, 0), Color.WHITE, width * 0.035f)
    }

    private fun drawBestModelObservation(canvas: Canvas, width: Float, height: Float) {
      val observation = project.observations.maxByOrNull { it.confidence } ?: return
      val confidence = (observation.confidence * 100f).toInt().coerceIn(0, 100)
      val label = "MODEL ${observation.label.uppercase()} $confidence%"
      val pillWidth = drawPill(
        canvas = canvas,
        left = 28f,
        top = 82f,
        text = label,
        background = Color.argb(200, 20, 100, 220),
        foreground = Color.WHITE,
        textSize = width * 0.034f
      )

      val left = observation.left
      val top = observation.top
      val right = observation.right
      val bottom = observation.bottom
      if (left != null && top != null && right != null && bottom != null) {
        strokePaint.color = Color.argb(230, 60, 220, 120)
        strokePaint.strokeWidth = (width * 0.01f).coerceAtLeast(5f)
        canvas.drawRoundRect(
          RectF(left * width, top * height, right * width, bottom * height),
          18f,
          18f,
          strokePaint
        )
      }

      if (pillWidth < 0f) return
    }

    private fun drawFilter(canvas: Canvas, width: Float, height: Float) {
      if (project.filterId == "none") return
      val cx = width / 2f
      val cy = height * 0.2f
      val accent = Color.argb(230, 255, 215, 70)

      when (project.filterId) {
        "crown", "king", "emperor" -> drawCrown(canvas, cx, cy, width * 0.28f, accent)
        "glasses" -> drawGlasses(canvas, cx, cy, width * 0.28f)
        "pirate" -> drawPiratePatch(canvas, cx, cy, width * 0.22f)
        "detective" -> drawDetectiveGlass(canvas, cx, cy, width * 0.2f)
        "billionaire" -> drawLargeLabel(canvas, "$$$", cx, cy, width * 0.12f, Color.argb(235, 30, 210, 80))
        "cowboy" -> drawCowboyHat(canvas, cx, cy, width * 0.3f)
        "astronaut" -> drawHelmet(canvas, cx, cy, width * 0.26f)
        "gigachad" -> drawLargeLabel(canvas, "CHAD", cx, cy, width * 0.09f, Color.WHITE)
        "clown" -> drawClownNose(canvas, cx, cy, width * 0.12f)
        else -> drawLargeLabel(canvas, project.filterId.uppercase(), cx, cy, width * 0.06f, Color.WHITE)
      }

      drawPill(
        canvas = canvas,
        left = cx - width * 0.18f,
        top = cy + width * 0.18f,
        text = project.filterId.uppercase(),
        background = Color.argb(185, 0, 0, 0),
        foreground = Color.WHITE,
        textSize = width * 0.034f
      )
    }

    private fun drawCaptionBox(
      canvas: Canvas,
      text: String,
      centerX: Float,
      bottomY: Float,
      maxWidth: Int,
      textSize: Float
    ) {
      textPaint.textSize = textSize
      textPaint.color = Color.WHITE
      textPaint.textAlign = Paint.Align.LEFT
      val layout = StaticLayout.Builder.obtain(text, 0, text.length, textPaint, maxWidth)
        .setAlignment(Layout.Alignment.ALIGN_CENTER)
        .setLineSpacing(0f, 1.02f)
        .setMaxLines(4)
        .build()
      val pad = textSize * 0.38f
      val boxWidth = layout.width + pad * 2f
      val boxHeight = layout.height + pad * 2f
      val left = centerX - boxWidth / 2f
      val top = bottomY - boxHeight
      shapePaint.style = Paint.Style.FILL
      shapePaint.color = Color.argb(205, 0, 0, 0)
      canvas.drawRoundRect(RectF(left, top, left + boxWidth, top + boxHeight), 22f, 22f, shapePaint)
      canvas.save()
      canvas.translate(left + pad, top + pad)
      layout.draw(canvas)
      canvas.restore()
    }

    private fun drawPill(
      canvas: Canvas,
      left: Float,
      top: Float,
      text: String,
      background: Int,
      foreground: Int,
      textSize: Float
    ): Float {
      textPaint.textSize = textSize.coerceIn(22f, 42f)
      textPaint.color = foreground
      textPaint.textAlign = Paint.Align.LEFT
      val paddingX = textPaint.textSize * 0.55f
      val paddingY = textPaint.textSize * 0.34f
      val width = textPaint.measureText(text) + paddingX * 2f
      val height = textPaint.textSize + paddingY * 2f
      shapePaint.style = Paint.Style.FILL
      shapePaint.color = background
      canvas.drawRoundRect(RectF(left, top, left + width, top + height), height / 2f, height / 2f, shapePaint)
      canvas.drawText(text, left + paddingX, top + paddingY + textPaint.textSize * 0.78f, textPaint)
      return width
    }

    private fun drawCrown(canvas: Canvas, cx: Float, cy: Float, size: Float, color: Int) {
      shapePaint.style = Paint.Style.FILL
      shapePaint.color = color
      val half = size / 2f
      val path = Path().apply {
        moveTo(cx - half, cy + half * 0.35f)
        lineTo(cx - half * 0.72f, cy - half * 0.45f)
        lineTo(cx - half * 0.25f, cy + half * 0.05f)
        lineTo(cx, cy - half * 0.7f)
        lineTo(cx + half * 0.25f, cy + half * 0.05f)
        lineTo(cx + half * 0.72f, cy - half * 0.45f)
        lineTo(cx + half, cy + half * 0.35f)
        close()
      }
      canvas.drawPath(path, shapePaint)
    }

    private fun drawGlasses(canvas: Canvas, cx: Float, cy: Float, size: Float) {
      strokePaint.color = Color.WHITE
      strokePaint.strokeWidth = size * 0.08f
      val r = size * 0.22f
      canvas.drawCircle(cx - r * 1.25f, cy, r, strokePaint)
      canvas.drawCircle(cx + r * 1.25f, cy, r, strokePaint)
      canvas.drawLine(cx - r * 0.25f, cy, cx + r * 0.25f, cy, strokePaint)
    }

    private fun drawPiratePatch(canvas: Canvas, cx: Float, cy: Float, size: Float) {
      shapePaint.style = Paint.Style.FILL
      shapePaint.color = Color.argb(235, 0, 0, 0)
      canvas.drawOval(RectF(cx - size * 0.45f, cy - size * 0.28f, cx + size * 0.15f, cy + size * 0.28f), shapePaint)
      strokePaint.color = Color.WHITE
      strokePaint.strokeWidth = size * 0.06f
      canvas.drawLine(cx - size * 0.8f, cy - size * 0.55f, cx + size * 0.8f, cy + size * 0.25f, strokePaint)
    }

    private fun drawDetectiveGlass(canvas: Canvas, cx: Float, cy: Float, size: Float) {
      strokePaint.color = Color.WHITE
      strokePaint.strokeWidth = size * 0.08f
      canvas.drawCircle(cx - size * 0.12f, cy - size * 0.06f, size * 0.32f, strokePaint)
      canvas.drawLine(cx + size * 0.12f, cy + size * 0.18f, cx + size * 0.55f, cy + size * 0.62f, strokePaint)
    }

    private fun drawCowboyHat(canvas: Canvas, cx: Float, cy: Float, size: Float) {
      shapePaint.style = Paint.Style.FILL
      shapePaint.color = Color.rgb(145, 85, 35)
      canvas.drawOval(RectF(cx - size * 0.55f, cy, cx + size * 0.55f, cy + size * 0.22f), shapePaint)
      canvas.drawRoundRect(RectF(cx - size * 0.28f, cy - size * 0.36f, cx + size * 0.28f, cy + size * 0.14f), 20f, 20f, shapePaint)
    }

    private fun drawHelmet(canvas: Canvas, cx: Float, cy: Float, size: Float) {
      strokePaint.color = Color.WHITE
      strokePaint.strokeWidth = size * 0.07f
      canvas.drawOval(RectF(cx - size * 0.5f, cy - size * 0.45f, cx + size * 0.5f, cy + size * 0.45f), strokePaint)
      strokePaint.color = Color.argb(220, 80, 190, 255)
      canvas.drawRoundRect(RectF(cx - size * 0.3f, cy - size * 0.08f, cx + size * 0.3f, cy + size * 0.25f), 16f, 16f, strokePaint)
    }

    private fun drawClownNose(canvas: Canvas, cx: Float, cy: Float, size: Float) {
      shapePaint.style = Paint.Style.FILL
      shapePaint.color = Color.rgb(245, 30, 60)
      canvas.drawCircle(cx, cy, size * 0.28f, shapePaint)
    }

    private fun drawLargeLabel(canvas: Canvas, text: String, cx: Float, cy: Float, size: Float, color: Int) {
      textPaint.textSize = size
      textPaint.color = color
      textPaint.textAlign = Paint.Align.CENTER
      strokePaint.color = Color.argb(180, 0, 0, 0)
      strokePaint.strokeWidth = size * 0.08f
      strokePaint.style = Paint.Style.STROKE
      canvas.drawText(text, cx, cy, strokePaint)
      canvas.drawText(text, cx, cy, textPaint)
    }
  }
}
