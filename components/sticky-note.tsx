"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

type StickyNoteProps = {
  note: { id: string; x: number; y: number; text: string }
  onUpdate: (updates: { x?: number; y?: number; text?: string }) => void
  onDelete: () => void
}

export function StickyNote({ note, onUpdate, onDelete }: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    onUpdate({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  return (
    <div
      className="absolute w-48 h-48 bg-yellow-200 shadow-lg rounded-sm p-3 cursor-move"
      style={{ left: note.x, top: note.y }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className="flex justify-end mb-1">
        <button onClick={onDelete} className="text-gray-500 hover:text-red-600 p-1" title="Delete note">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          className="w-full h-32 bg-transparent border-none outline-none resize-none font-handwriting text-gray-800"
          placeholder="Type your note..."
        />
      ) : (
        <div className="w-full h-32 overflow-auto font-handwriting text-gray-800 whitespace-pre-wrap">{note.text}</div>
      )}
    </div>
  )
}
