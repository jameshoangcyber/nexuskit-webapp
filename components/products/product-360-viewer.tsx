"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { RotateCcw, Maximize2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

interface Product360ViewerProps {
  images: string[]
  productName: string
}

export default function Product360Viewer({ images, productName }: Product360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startFrame, setStartFrame] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const totalFrames = images.length

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % totalFrames)
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, totalFrames])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setStartFrame(currentFrame)
    setIsPlaying(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startX
    const sensitivity = 2
    const frameChange = Math.floor(deltaX / sensitivity)
    const newFrame = (startFrame + frameChange) % totalFrames
    setCurrentFrame(newFrame < 0 ? totalFrames + newFrame : newFrame)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const resetView = () => {
    setCurrentFrame(0)
    setIsPlaying(false)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className={`relative ${isFullscreen ? "h-screen" : "h-96"} bg-gray-900 rounded-lg overflow-hidden`}
        >
          {/* Main 360° Image */}
          <div
            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={images[currentFrame] || "/placeholder.svg?height=400&width=400"}
              alt={`${productName} - Frame ${currentFrame + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4">
              {/* Frame Slider */}
              <div className="mb-4">
                <Slider
                  value={[currentFrame]}
                  onValueChange={(value) => setCurrentFrame(value[0])}
                  max={totalFrames - 1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Frame 1</span>
                  <span>
                    Frame {currentFrame + 1} / {totalFrames}
                  </span>
                  <span>Frame {totalFrames}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetView} className="text-white hover:bg-white/20">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center text-white text-sm">
                  <p>Kéo để xoay • Click để phát/dừng</p>
                </div>

                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isDragging && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white text-sm">Frame {currentFrame + 1}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
