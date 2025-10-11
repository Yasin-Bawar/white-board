"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"

type Tool = "select" | "hand" | "pen" | "eraser" | "rectangle" | "circle" | "line" | "arrow" | "text" | "sticky"

type StickyNote = {
  id: string
  x: number
  y: number
  text: string
  color: string
}

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("pen")
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [color, setColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(3)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPath, setCurrentPath] = useState<ImageData | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const container = containerRef.current
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      ctx.fillStyle = "#FFFBEB"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200))
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50))
  const handleZoomReset = () => setZoom(100)

  const getCanvasPoint = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const addStickyNote = (x: number, y: number) => {
    const colors = ["#FEF08A", "#FED7AA", "#FCA5A5", "#C4B5FD", "#A7F3D0", "#BAE6FD"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const newNote: StickyNote = {
      id: Date.now().toString(),
      x: x - 90,
      y: y - 90,
      text: "Type here...",
      color: randomColor
    }
    setStickyNotes([...stickyNotes, newNote])
  }

  const updateStickyNote = (id: string, text: string) => {
    setStickyNotes(stickyNotes.map(note =>
      note.id === id ? { ...note, text } : note
    ))
  }

  const deleteStickyNote = (id: string) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id))
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === "sticky" && e.target === e.currentTarget) {
      const point = getCanvasPoint(e)
      addStickyNote(point.x, point.y)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "sticky") {
      const point = getCanvasPoint(e)
      addStickyNote(point.x, point.y)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const point = getCanvasPoint(e)

    if (tool === "hand") {
      setIsPanning(true)
      setStartPos({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      return
    }

    if (tool === "select") return

    setIsDrawing(true)
    setStartPos(point)

    if (tool !== "pen" && tool !== "eraser") {
      setCurrentPath(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }

    if (tool === "pen") {
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
    } else if (tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = lineWidth * 3
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const point = getCanvasPoint(e)

    if (tool === "hand" && isPanning) {
      setPanOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      })
      return
    }

    if (!isDrawing) return

    if (tool === "pen") {
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      ctx.globalCompositeOperation = "source-over"
    } else if (currentPath) {
      ctx.putImageData(currentPath, 0, 0)

      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      const width = point.x - startPos.x
      const height = point.y - startPos.y

      if (tool === "rectangle") {
        ctx.strokeRect(startPos.x, startPos.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(width * width + height * height)
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (tool === "line") {
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      } else if (tool === "arrow") {
        drawArrow(ctx, startPos.x, startPos.y, point.x, point.y)
      }
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "hand") {
      setIsPanning(false)
      return
    }

    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const point = getCanvasPoint(e)

    if (tool !== "pen" && tool !== "eraser" && currentPath) {
      ctx.putImageData(currentPath, 0, 0)

      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      const width = point.x - startPos.x
      const height = point.y - startPos.y

      if (tool === "rectangle") {
        ctx.strokeRect(startPos.x, startPos.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(width * width + height * height)
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (tool === "line") {
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      } else if (tool === "arrow") {
        drawArrow(ctx, startPos.x, startPos.y, point.x, point.y)
      }
    }

    setIsDrawing(false)
    setCurrentPath(null)
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 15
    const angle = Math.atan2(toY - fromY, toX - fromX)

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#FFFBEB"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setStickyNotes([])
  }

  const colors = ["#000000", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#FFFBEB]"
      onClick={handleContainerClick}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`w-full h-full ${tool === "hand" ? "cursor-grab" : tool === "pen" ? "cursor-crosshair" : tool === "sticky" ? "cursor-copy" : "cursor-default"}`}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "center"
        }}
      />

      {/* Sticky Notes */}
      {stickyNotes.map((note) => (
        <div
          key={note.id}
          className="absolute group pointer-events-auto"
          style={{
            left: note.x,
            top: note.y,
            width: "180px",
            height: "180px",
            zIndex: 40
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full h-full p-4 rounded-xl shadow-2xl cursor-move relative border-2 border-black/10"
            style={{ backgroundColor: note.color }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteStickyNote(note.id)
              }}
              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-lg font-bold shadow-lg"
            >
              ×
            </button>
            <textarea
              value={note.text}
              onChange={(e) => {
                e.stopPropagation()
                updateStickyNote(note.id, e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-base"
              style={{ color: "#000", fontFamily: "Comic Sans MS, cursive" }}
              placeholder="Type here..."
            />
          </div>
        </div>
      ))}

      {/* Bottom Left - Tool Menu */}
      <div className="absolute bottom-6 left-6 z-50 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("select")
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Bottom Center - Main Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-2xl border-2 border-yellow-300 px-3 py-2.5 flex items-center gap-1 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("select")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "select" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Select (V)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("hand")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "hand" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Hand (H)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("pen")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "pen" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Pen (P)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <div className="w-px h-7 bg-yellow-300 mx-1" />

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("sticky")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "sticky" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Sticky Note (N)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10l6-6V5c0-1.1-.9-2-2-2zm-7 2h2v10h-2V5zm4 14.5V14h5.5L16 19.5z" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("rectangle")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "rectangle" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Rectangle (R)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="6" width="16" height="12" strokeWidth={2} rx="2" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("circle")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "circle" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Circle (O)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" strokeWidth={2} />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("arrow")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "arrow" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Arrow (A)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("line")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "line" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Line (L)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("text")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "text" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Text (T)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setTool("eraser")
          }}
          className={`p-2.5 rounded-xl transition-all ${tool === "eraser" ? "bg-yellow-400 text-white shadow-lg" : "text-gray-700 hover:bg-yellow-100"}`}
          title="Eraser (E)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div className="w-px h-7 bg-yellow-300 mx-1" />

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowColorPicker(!showColorPicker)
            }}
            className="w-9 h-9 rounded-lg border-2 border-yellow-400 hover:border-yellow-500 transition-all shadow-sm"
            style={{ backgroundColor: color }}
            title="Color"
          />

          {showColorPicker && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-2xl border-2 border-yellow-300 p-3">
              <div className="grid grid-cols-4 gap-2 mb-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation()
                      setColor(c)
                      setShowColorPicker(false)
                    }}
                    className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? "#FBBF24" : "transparent"
                    }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-2 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLineWidth(Math.max(1, lineWidth - 1))
            }}
            className="p-1.5 text-gray-700 hover:bg-yellow-100 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <div className="text-xs font-medium text-gray-700 min-w-[24px] text-center">
            {lineWidth}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLineWidth(Math.min(20, lineWidth + 1))
            }}
            className="p-1.5 text-gray-700 hover:bg-yellow-100 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Right - Zoom & Actions */}
      <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 pointer-events-auto">
        {/* Clear Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            clearCanvas()
          }}
          className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 text-gray-700 hover:bg-yellow-100 rounded-xl shadow-lg border-2 border-yellow-300 transition-all"
          title="Clear Canvas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Zoom Controls */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg border-2 border-yellow-300 px-2 py-1.5 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomOut()
            }}
            className="p-2 text-gray-700 hover:bg-yellow-100 rounded-lg transition-all"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomReset()
            }}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-yellow-100 rounded-lg transition-all min-w-[55px]"
          >
            {zoom}%
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomIn()
            }}
            className="p-2 text-gray-700 hover:bg-yellow-100 rounded-lg transition-all"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
