"use client"

import { useState } from "react"
import { Code, Edit, Save, X, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

const portfolioId = "689d21754780b3f30cf4130b" // Replace with actual portfolio ID

function TechHighlights({ techHighlights, setTechHighlights }) {
  const [isEditingTech, setIsEditingTech] = useState(false)
  const [editTech, setEditTech] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const handleEditTech = () => {
    setIsEditingTech(true)
    setEditTech(techHighlights.map((t) => ({ ...t })))
    toast.success("Edit mode enabled", {
      icon: "✏️",
      duration: 2000,
    })
  }

  const handleSaveTech = async () => {
    setIsSaving(true)

    const loadingToast = toast.loading("Saving tech highlights...", {
      icon: "💾",
    })

    try {
      const response = await fetch(`http://localhost:3001/api/portfolio/${portfolioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          techHighlights: editTech,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save tech highlights")
      }

      const updatedPortfolio = await response.json()
      setTechHighlights(editTech)
      setIsEditingTech(false)

      toast.dismiss(loadingToast)
      toast.success("Tech highlights saved successfully!", {
        icon: "✅",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving tech highlights:", error)

      toast.dismiss(loadingToast)
      toast.error(error.message || "Failed to save changes. Please try again.", {
        icon: "❌",
        duration: 4000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelTech = () => {
    setEditTech(techHighlights.map((t) => ({ ...t })))
    setIsEditingTech(false)

    toast("Changes cancelled", {
      icon: "↩️",
      duration: 2000,
    })
  }

  const updateTech = (index, field, value) => {
    setEditTech((prev) => prev.map((tech, i) => (i === index ? { ...tech, [field]: value } : tech)))
  }

  const addNewTech = () => {
    if (editTech.length >= 4) {
      toast.error("Maximum 4 tech highlights allowed", {
        icon: "⚠️",
        duration: 3000,
      })
      return
    }

    const newTech = {
      technology: "",
      rating: 3,
      description: "",
    }
    setEditTech([...editTech, newTech])

    toast.success("New tech highlight added", {
      icon: "➕",
      duration: 2000,
    })
  }

  const removeTech = (index) => {
    const techName = editTech[index].technology || "Tech highlight"
    setEditTech((prev) => prev.filter((_, i) => i !== index))

    toast.success(`${techName} removed`, {
      icon: "🗑️",
      duration: 2000,
    })
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>

      {/* Section Header */}
      <div className="flex flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-lg sm:text-xl font-semibold text-white flex items-center">
          <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg mr-3 border border-cyan-500/30">
            <Code className="w-5 h-5 text-cyan-400" />
          </div>
          Tech Highlights
        </h1>

        {!isEditingTech ? (
          <button
            onClick={handleEditTech}
            className="p-2 bg-gray-900/50 border border-cyan-500/50 hover:border-cyan-400 rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)] group w-auto justify-center"
          >
            <Edit className="w-4 h-4 text-cyan-400" />
          </button>
        ) : (
          <div className="flex w-auto gap-1 ml-[-18px]">
            <button
              onClick={addNewTech}
              disabled={isSaving || editTech.length >= 4}
              className={`flex sm:flex-none p-2 bg-gray-900/50 border rounded-lg transition-all duration-300 group disabled:opacity-50 ${
                editTech.length >= 4
                  ? "border-gray-500/50 cursor-not-allowed"
                  : "border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              }`}
              title={editTech.length >= 4 ? "Maximum 4 tech highlights allowed" : "Add new tech highlight"}
            >
              <Plus className={`w-4 h-4 sm:w-3 sm:h-3 ${editTech.length >= 4 ? "text-gray-500" : "text-blue-400"}`} />
            </button>
            <button
              onClick={handleSaveTech}
              disabled={isSaving}
              className="flex sm:flex-none p-2 bg-gray-900/50 border border-green-500/50 hover:border-green-400 rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] group disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3 h-3 sm:w-3 sm:h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-3 sm:h-3 text-green-400" />
              )}
            </button>
            <button
              onClick={handleCancelTech}
              disabled={isSaving}
              className="flex sm:flex-none p-2 bg-gray-900/50 border border-red-500/50 hover:border-red-400 rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] group disabled:opacity-50"
            >
              <X className="w-4 h-4 sm:w-3 sm:h-3 text-red-400" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {(isEditingTech ? editTech : techHighlights).map((tech, index) => (
          <div
            key={index}
            className="flex flex-row w-full items-center justify-between p-2 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg border border-gray-700/30 relative"
          >
            {isEditingTech ? (
              <input
                type="text"
                value={tech.technology}
                onChange={(e) => updateTech(index, "technology", e.target.value)}
                placeholder="Technology"
                className="text-sm text-gray-300 bg-transparent border-none w-[50%] focus:outline-none placeholder-gray-500"
                disabled={isSaving}
              />
            ) : (
              <span className="text-sm text-gray-300">{tech.technology}</span>
            )}

            <div className="flex items-center gap-2">
              {isEditingTech ? (
                <select
                  value={tech.rating}
                  onChange={(e) => updateTech(index, "rating", Number.parseInt(e.target.value))}
                  disabled={isSaving}
                  className="text-xs bg-gray-800/80 border border-gray-600/50 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              ) : (
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < tech.rating ? "bg-cyan-400" : "bg-gray-600"}`}
                      title={`${tech.rating} star${tech.rating > 1 ? "s" : ""}`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({tech.rating}/5)</span>
                </div>
              )}
            </div>

            {isEditingTech && (
              <button
                onClick={() => removeTech(index)}
                disabled={isSaving}
                className="ml-[2px] p-1 bg-red-500/20 border border-red-500/50 rounded hover:bg-red-500/30 transition-colors duration-300 disabled:opacity-50"
              >
                <Trash2 className=" w-3 h-3 text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TechHighlights
