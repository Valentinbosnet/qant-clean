// This file will be loaded client-side only
;(() => {
  // Create the UI elements
  function createUI() {
    const container = document.querySelector(".container")
    if (!container) return

    // Clear existing content
    container.innerHTML = ""

    // Create header
    const header = document.createElement("h1")
    header.className = "text-2xl font-bold mb-4"
    header.textContent = "Compression Settings"
    container.appendChild(header)

    // Create card
    const card = document.createElement("div")
    card.className = "bg-white rounded-lg shadow p-6"
    container.appendChild(card)

    // Create card header
    const cardHeader = document.createElement("div")
    cardHeader.className = "mb-6"
    card.appendChild(cardHeader)

    const cardTitle = document.createElement("h2")
    cardTitle.className = "text-xl font-semibold mb-2"
    cardTitle.textContent = "Offline Storage Compression"
    cardHeader.appendChild(cardTitle)

    const cardDescription = document.createElement("p")
    cardDescription.className = "text-gray-600"
    cardDescription.textContent = "Configure how your offline data is compressed to save space"
    cardHeader.appendChild(cardDescription)

    // Create tabs
    const tabs = document.createElement("div")
    tabs.className = "mb-6"
    card.appendChild(tabs)

    const tabsHeader = document.createElement("div")
    tabsHeader.className = "flex border-b mb-4"
    tabs.appendChild(tabsHeader)

    const tabLabels = ["Settings", "Analysis", "Statistics"]
    const tabIds = ["settings", "analysis", "statistics"]

    const tabButtons = tabIds.map((id, index) => {
      const button = document.createElement("button")
      button.className = `px-4 py-2 ${index === 0 ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`
      button.textContent = tabLabels[index]
      button.dataset.tab = id
      button.addEventListener("click", () => switchTab(id))
      tabsHeader.appendChild(button)
      return button
    })

    // Create tab content
    const tabContent = document.createElement("div")
    tabContent.className = "tab-content"
    tabs.appendChild(tabContent)

    // Initial tab content
    renderSettingsTab(tabContent)

    // Tab switching function
    function switchTab(tabId) {
      // Update active tab button
      tabButtons.forEach((btn, index) => {
        if (btn.dataset.tab === tabId) {
          btn.className = "px-4 py-2 border-b-2 border-blue-500 text-blue-500"
        } else {
          btn.className = "px-4 py-2 text-gray-500"
        }
      })

      // Clear tab content
      tabContent.innerHTML = ""

      // Render appropriate tab content
      if (tabId === "settings") {
        renderSettingsTab(tabContent)
      } else if (tabId === "analysis") {
        renderAnalysisTab(tabContent)
      } else if (tabId === "statistics") {
        renderStatisticsTab(tabContent)
      }
    }
  }

  // Mock data
  const mockStats = {
    totalItems: 42,
    totalSize: 2.7, // MB
    compressedSize: 1.5, // MB
    compressionRatio: 1.8,
    lastCompression: "2023-05-20T10:30:00Z",
    largestItems: [
      { key: "stock-data-AAPL", size: 450, compressedSize: 280 },
      { key: "market-overview", size: 380, compressedSize: 210 },
      { key: "user-preferences", size: 120, compressedSize: 60 },
    ],
    compressionByType: [
      { type: "JSON", count: 28, originalSize: 1.8, compressedSize: 0.9 },
      { type: "Images", count: 8, originalSize: 0.7, compressedSize: 0.5 },
      { type: "Text", count: 6, originalSize: 0.2, compressedSize: 0.1 },
    ],
  }

  const mockSettings = {
    compressionEnabled: true,
    compressionLevel: 6, // 1-9
    compressionThreshold: 1024, // bytes
    autoCompress: true,
    compressOnBackground: true,
    storageQuota: 50 * 1024 * 1024, // 50MB
  }

  const mockAnalysis = {
    suggestions: [
      "Increase compression level to save 20% more space",
      "Remove old stock data to free up 500KB",
      "Compress images to save 300KB",
    ],
    savings: {
      current: 1.2, // MB
      potential: 1.8, // MB
    },
    largestItems: [
      { key: "stock-data-AAPL", size: 450, compressedSize: 280, recommendation: "Keep" },
      { key: "market-overview", size: 380, compressedSize: 210, recommendation: "Compress more" },
      { key: "historical-data", size: 320, compressedSize: 180, recommendation: "Remove" },
    ],
  }

  // Render settings tab
  function renderSettingsTab(container) {
    const form = document.createElement("form")
    form.className = "space-y-4"
    container.appendChild(form)

    // Compression toggle
    const toggleDiv = document.createElement("div")
    toggleDiv.className = "flex items-center justify-between"
    form.appendChild(toggleDiv)

    const toggleLabel = document.createElement("label")
    toggleLabel.className = "font-medium"
    toggleLabel.textContent = "Enable Compression"
    toggleDiv.appendChild(toggleLabel)

    const toggleSwitch = document.createElement("div")
    toggleSwitch.className = `w-11 h-6 bg-${mockSettings.compressionEnabled ? "green" : "gray"}-200 rounded-full p-1 cursor-pointer`
    toggleSwitch.innerHTML = `
      <div class="bg-white w-4 h-4 rounded-full shadow-md transform ${mockSettings.compressionEnabled ? "translate-x-5" : ""}"></div>
    `
    toggleSwitch.addEventListener("click", () => {
      mockSettings.compressionEnabled = !mockSettings.compressionEnabled
      renderSettingsTab(container)
    })
    toggleDiv.appendChild(toggleSwitch)

    // Compression level
    const levelDiv = document.createElement("div")
    levelDiv.className = "space-y-2"
    form.appendChild(levelDiv)

    const levelLabel = document.createElement("label")
    levelLabel.className = "font-medium block"
    levelLabel.textContent = "Compression Level"
    levelDiv.appendChild(levelLabel)

    const levelDescription = document.createElement("p")
    levelDescription.className = "text-sm text-gray-500"
    levelDescription.textContent = "Higher levels save more space but may be slower"
    levelDiv.appendChild(levelDescription)

    const levelSliderContainer = document.createElement("div")
    levelSliderContainer.className = "flex items-center space-x-2"
    levelDiv.appendChild(levelSliderContainer)

    const levelSlider = document.createElement("input")
    levelSlider.type = "range"
    levelSlider.min = "1"
    levelSlider.max = "9"
    levelSlider.value = mockSettings.compressionLevel.toString()
    levelSlider.className = "w-full"
    levelSlider.addEventListener("input", (e) => {
      mockSettings.compressionLevel = Number.parseInt(e.target.value)
      levelValue.textContent = e.target.value
    })
    levelSliderContainer.appendChild(levelSlider)

    const levelValue = document.createElement("span")
    levelValue.className = "font-medium"
    levelValue.textContent = mockSettings.compressionLevel.toString()
    levelSliderContainer.appendChild(levelValue)

    // Compression threshold
    const thresholdDiv = document.createElement("div")
    thresholdDiv.className = "space-y-2"
    form.appendChild(thresholdDiv)

    const thresholdLabel = document.createElement("label")
    thresholdLabel.className = "font-medium block"
    thresholdLabel.textContent = "Compression Threshold (bytes)"
    thresholdDiv.appendChild(thresholdLabel)

    const thresholdDescription = document.createElement("p")
    thresholdDescription.className = "text-sm text-gray-500"
    thresholdDescription.textContent = "Only compress items larger than this size"
    thresholdDiv.appendChild(thresholdDescription)

    const thresholdInput = document.createElement("input")
    thresholdInput.type = "number"
    thresholdInput.value = mockSettings.compressionThreshold.toString()
    thresholdInput.className = "w-full p-2 border rounded"
    thresholdInput.addEventListener("input", (e) => {
      mockSettings.compressionThreshold = Number.parseInt(e.target.value)
    })
    thresholdDiv.appendChild(thresholdInput)

    // Auto compress
    const autoCompressDiv = document.createElement("div")
    autoCompressDiv.className = "flex items-center space-x-2"
    form.appendChild(autoCompressDiv)

    const autoCompressCheckbox = document.createElement("input")
    autoCompressCheckbox.type = "checkbox"
    autoCompressCheckbox.checked = mockSettings.autoCompress
    autoCompressCheckbox.className = "h-4 w-4"
    autoCompressCheckbox.addEventListener("change", (e) => {
      mockSettings.autoCompress = e.target.checked
    })
    autoCompressDiv.appendChild(autoCompressCheckbox)

    const autoCompressLabel = document.createElement("label")
    autoCompressLabel.className = "font-medium"
    autoCompressLabel.textContent = "Automatically compress new items"
    autoCompressDiv.appendChild(autoCompressLabel)

    // Background compress
    const bgCompressDiv = document.createElement("div")
    bgCompressDiv.className = "flex items-center space-x-2"
    form.appendChild(bgCompressDiv)

    const bgCompressCheckbox = document.createElement("input")
    bgCompressCheckbox.type = "checkbox"
    bgCompressCheckbox.checked = mockSettings.compressOnBackground
    bgCompressCheckbox.className = "h-4 w-4"
    bgCompressCheckbox.addEventListener("change", (e) => {
      mockSettings.compressOnBackground = e.target.checked
    })
    bgCompressDiv.appendChild(bgCompressCheckbox)

    const bgCompressLabel = document.createElement("label")
    bgCompressLabel.className = "font-medium"
    bgCompressLabel.textContent = "Compress items when app is in background"
    bgCompressDiv.appendChild(bgCompressLabel)

    // Storage quota
    const quotaDiv = document.createElement("div")
    quotaDiv.className = "space-y-2"
    form.appendChild(quotaDiv)

    const quotaLabel = document.createElement("label")
    quotaLabel.className = "font-medium block"
    quotaLabel.textContent = "Storage Quota (MB)"
    quotaDiv.appendChild(quotaLabel)

    const quotaDescription = document.createElement("p")
    quotaDescription.className = "text-sm text-gray-500"
    quotaDescription.textContent = "Maximum storage space to use for offline data"
    quotaDiv.appendChild(quotaDescription)

    const quotaInput = document.createElement("input")
    quotaInput.type = "number"
    quotaInput.value = (mockSettings.storageQuota / (1024 * 1024)).toString()
    quotaInput.className = "w-full p-2 border rounded"
    quotaInput.addEventListener("input", (e) => {
      mockSettings.storageQuota = Number.parseInt(e.target.value) * 1024 * 1024
    })
    quotaDiv.appendChild(quotaInput)

    // Save button
    const saveButton = document.createElement("button")
    saveButton.type = "button"
    saveButton.className = "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    saveButton.textContent = "Save Settings"
    saveButton.addEventListener("click", () => {
      alert("Settings saved!")
    })
    form.appendChild(saveButton)
  }

  // Render analysis tab
  function renderAnalysisTab(container) {
    const analysisDiv = document.createElement("div")
    analysisDiv.className = "space-y-6"
    container.appendChild(analysisDiv)

    // Suggestions
    const suggestionsDiv = document.createElement("div")
    suggestionsDiv.className = "space-y-2"
    analysisDiv.appendChild(suggestionsDiv)

    const suggestionsTitle = document.createElement("h3")
    suggestionsTitle.className = "font-medium"
    suggestionsTitle.textContent = "Suggestions"
    suggestionsDiv.appendChild(suggestionsTitle)

    const suggestionsList = document.createElement("ul")
    suggestionsList.className = "space-y-2"
    suggestionsDiv.appendChild(suggestionsList)

    mockAnalysis.suggestions.forEach((suggestion) => {
      const item = document.createElement("li")
      item.className = "flex items-start space-x-2"
      suggestionsList.appendChild(item)

      const icon = document.createElement("span")
      icon.className = "text-green-500"
      icon.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `
      item.appendChild(icon)

      const text = document.createElement("span")
      text.textContent = suggestion
      item.appendChild(text)
    })

    // Potential savings
    const savingsDiv = document.createElement("div")
    savingsDiv.className = "p-4 bg-blue-50 rounded"
    analysisDiv.appendChild(savingsDiv)

    const savingsTitle = document.createElement("h3")
    savingsTitle.className = "font-medium mb-2"
    savingsTitle.textContent = "Potential Space Savings"
    savingsDiv.appendChild(savingsTitle)

    const savingsContent = document.createElement("div")
    savingsContent.className = "flex items-center space-x-4"
    savingsDiv.appendChild(savingsContent)

    const currentSavings = document.createElement("div")
    currentSavings.className = "text-center"
    currentSavings.innerHTML = `
      <div class="text-2xl font-bold text-blue-600">${mockAnalysis.savings.current} MB</div>
      <div class="text-sm text-gray-500">Current</div>
    `
    savingsContent.appendChild(currentSavings)

    const arrow = document.createElement("div")
    arrow.className = "text-gray-400"
    arrow.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
    `
    savingsContent.appendChild(arrow)

    const potentialSavings = document.createElement("div")
    potentialSavings.className = "text-center"
    potentialSavings.innerHTML = `
      <div class="text-2xl font-bold text-green-600">${mockAnalysis.savings.potential} MB</div>
      <div class="text-sm text-gray-500">Potential</div>
    `
    savingsContent.appendChild(potentialSavings)

    // Largest items
    const largestItemsDiv = document.createElement("div")
    largestItemsDiv.className = "space-y-2"
    analysisDiv.appendChild(largestItemsDiv)

    const largestItemsTitle = document.createElement("h3")
    largestItemsTitle.className = "font-medium"
    largestItemsTitle.textContent = "Largest Items"
    largestItemsDiv.appendChild(largestItemsTitle)

    const largestItemsTable = document.createElement("table")
    largestItemsTable.className = "w-full border-collapse"
    largestItemsDiv.appendChild(largestItemsTable)

    const thead = document.createElement("thead")
    largestItemsTable.appendChild(thead)

    const headerRow = document.createElement("tr")
    headerRow.className = "bg-gray-100"
    thead.appendChild(headerRow)
    ;["Key", "Size (KB)", "Compressed (KB)", "Recommendation"].forEach((text) => {
      const th = document.createElement("th")
      th.className = "text-left p-2"
      th.textContent = text
      headerRow.appendChild(th)
    })

    const tbody = document.createElement("tbody")
    largestItemsTable.appendChild(tbody)

    mockAnalysis.largestItems.forEach((item) => {
      const row = document.createElement("tr")
      row.className = "border-t hover:bg-gray-50"
      tbody.appendChild(row)

      const keyCell = document.createElement("td")
      keyCell.className = "p-2"
      keyCell.textContent = item.key
      row.appendChild(keyCell)

      const sizeCell = document.createElement("td")
      sizeCell.className = "p-2"
      sizeCell.textContent = item.size.toString()
      row.appendChild(sizeCell)

      const compressedCell = document.createElement("td")
      compressedCell.className = "p-2"
      compressedCell.textContent = item.compressedSize.toString()
      row.appendChild(compressedCell)

      const recommendationCell = document.createElement("td")
      recommendationCell.className = "p-2"

      let recommendationClass = "text-gray-600"
      if (item.recommendation === "Keep") {
        recommendationClass = "text-green-600"
      } else if (item.recommendation === "Remove") {
        recommendationClass = "text-red-600"
      } else {
        recommendationClass = "text-yellow-600"
      }

      recommendationCell.className = `p-2 ${recommendationClass}`
      recommendationCell.textContent = item.recommendation
      row.appendChild(recommendationCell)
    })

    // Action buttons
    const actionsDiv = document.createElement("div")
    actionsDiv.className = "flex space-x-2 mt-4"
    analysisDiv.appendChild(actionsDiv)

    const compressButton = document.createElement("button")
    compressButton.className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    compressButton.textContent = "Compress All"
    compressButton.addEventListener("click", () => {
      alert("Compression started!")
    })
    actionsDiv.appendChild(compressButton)

    const cleanupButton = document.createElement("button")
    cleanupButton.className = "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    cleanupButton.textContent = "Clean Up Storage"
    cleanupButton.addEventListener("click", () => {
      alert("Storage cleanup started!")
    })
    actionsDiv.appendChild(cleanupButton)
  }

  // Render statistics tab
  function renderStatisticsTab(container) {
    const statsDiv = document.createElement("div")
    statsDiv.className = "space-y-6"
    container.appendChild(statsDiv)

    // Overview
    const overviewDiv = document.createElement("div")
    overviewDiv.className = "grid grid-cols-2 md:grid-cols-4 gap-4"
    statsDiv.appendChild(overviewDiv)

    const statCards = [
      { label: "Total Items", value: mockStats.totalItems },
      { label: "Original Size", value: `${mockStats.totalSize} MB` },
      { label: "Compressed Size", value: `${mockStats.compressedSize} MB` },
      { label: "Compression Ratio", value: `${mockStats.compressionRatio}x` },
    ]

    statCards.forEach((stat) => {
      const card = document.createElement("div")
      card.className = "bg-gray-50 p-4 rounded text-center"
      overviewDiv.appendChild(card)

      const value = document.createElement("div")
      value.className = "text-2xl font-bold"
      value.textContent = stat.value.toString()
      card.appendChild(value)

      const label = document.createElement("div")
      label.className = "text-sm text-gray-500"
      label.textContent = stat.label
      card.appendChild(label)
    })

    // Last compression
    const lastCompressionDiv = document.createElement("div")
    lastCompressionDiv.className = "p-4 bg-gray-50 rounded"
    statsDiv.appendChild(lastCompressionDiv)

    const lastCompressionTitle = document.createElement("h3")
    lastCompressionTitle.className = "font-medium mb-2"
    lastCompressionTitle.textContent = "Last Compression"
    lastCompressionDiv.appendChild(lastCompressionTitle)

    const lastCompressionDate = document.createElement("div")
    lastCompressionDate.className = "text-lg"
    lastCompressionDate.textContent = new Date(mockStats.lastCompression).toLocaleString()
    lastCompressionDiv.appendChild(lastCompressionDate)

    // Compression by type
    const byTypeDiv = document.createElement("div")
    byTypeDiv.className = "space-y-2"
    statsDiv.appendChild(byTypeDiv)

    const byTypeTitle = document.createElement("h3")
    byTypeTitle.className = "font-medium"
    byTypeTitle.textContent = "Compression by Type"
    byTypeDiv.appendChild(byTypeTitle)

    const byTypeTable = document.createElement("table")
    byTypeTable.className = "w-full border-collapse"
    byTypeDiv.appendChild(byTypeTable)

    const thead = document.createElement("thead")
    byTypeTable.appendChild(thead)

    const headerRow = document.createElement("tr")
    headerRow.className = "bg-gray-100"
    thead.appendChild(headerRow)
    ;["Type", "Count", "Original Size (MB)", "Compressed Size (MB)", "Savings"].forEach((text) => {
      const th = document.createElement("th")
      th.className = "text-left p-2"
      th.textContent = text
      headerRow.appendChild(th)
    })

    const tbody = document.createElement("tbody")
    byTypeTable.appendChild(tbody)

    mockStats.compressionByType.forEach((item) => {
      const row = document.createElement("tr")
      row.className = "border-t hover:bg-gray-50"
      tbody.appendChild(row)

      const typeCell = document.createElement("td")
      typeCell.className = "p-2"
      typeCell.textContent = item.type
      row.appendChild(typeCell)

      const countCell = document.createElement("td")
      countCell.className = "p-2"
      countCell.textContent = item.count.toString()
      row.appendChild(countCell)

      const originalSizeCell = document.createElement("td")
      originalSizeCell.className = "p-2"
      originalSizeCell.textContent = item.originalSize.toString()
      row.appendChild(originalSizeCell)

      const compressedSizeCell = document.createElement("td")
      compressedSizeCell.className = "p-2"
      compressedSizeCell.textContent = item.compressedSize.toString()
      row.appendChild(compressedSizeCell)

      const savingsCell = document.createElement("td")
      savingsCell.className = "p-2"
      const savings = (((item.originalSize - item.compressedSize) / item.originalSize) * 100).toFixed(1)
      savingsCell.textContent = `${savings}%`
      row.appendChild(savingsCell)
    })

    // Largest items
    const largestItemsDiv = document.createElement("div")
    largestItemsDiv.className = "space-y-2"
    statsDiv.appendChild(largestItemsDiv)

    const largestItemsTitle = document.createElement("h3")
    largestItemsTitle.className = "font-medium"
    largestItemsTitle.textContent = "Largest Items"
    largestItemsDiv.appendChild(largestItemsTitle)

    const largestItemsTable = document.createElement("table")
    largestItemsTable.className = "w-full border-collapse"
    largestItemsDiv.appendChild(largestItemsTable)

    const largestThead = document.createElement("thead")
    largestItemsTable.appendChild(largestThead)

    const largestHeaderRow = document.createElement("tr")
    largestHeaderRow.className = "bg-gray-100"
    largestThead.appendChild(largestHeaderRow)
    ;["Key", "Size (KB)", "Compressed (KB)", "Savings"].forEach((text) => {
      const th = document.createElement("th")
      th.className = "text-left p-2"
      th.textContent = text
      largestHeaderRow.appendChild(th)
    })

    const largestTbody = document.createElement("tbody")
    largestItemsTable.appendChild(largestTbody)

    mockStats.largestItems.forEach((item) => {
      const row = document.createElement("tr")
      row.className = "border-t hover:bg-gray-50"
      largestTbody.appendChild(row)

      const keyCell = document.createElement("td")
      keyCell.className = "p-2"
      keyCell.textContent = item.key
      row.appendChild(keyCell)

      const sizeCell = document.createElement("td")
      sizeCell.className = "p-2"
      sizeCell.textContent = item.size.toString()
      row.appendChild(sizeCell)

      const compressedCell = document.createElement("td")
      compressedCell.className = "p-2"
      compressedCell.textContent = item.compressedSize.toString()
      row.appendChild(compressedCell)

      const savingsCell = document.createElement("td")
      savingsCell.className = "p-2"
      const savings = (((item.size - item.compressedSize) / item.size) * 100).toFixed(1)
      savingsCell.textContent = `${savings}%`
      row.appendChild(savingsCell)
    })
  }

  // Initialize the UI
  createUI()
})()
