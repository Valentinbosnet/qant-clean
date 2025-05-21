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
    header.textContent = "Navigation Patterns"
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
    cardTitle.textContent = "Navigation Patterns"
    cardHeader.appendChild(cardTitle)

    const cardDescription = document.createElement("p")
    cardDescription.className = "text-gray-600"
    cardDescription.textContent = "Analyze how users navigate through your application"
    cardHeader.appendChild(cardDescription)

    // Create tabs
    const tabs = document.createElement("div")
    tabs.className = "mb-6"
    card.appendChild(tabs)

    const tabsHeader = document.createElement("div")
    tabsHeader.className = "flex border-b mb-4"
    tabs.appendChild(tabsHeader)

    const tabLabels = ["Frequent Routes", "Navigation Patterns", "Route Predictions"]
    const tabIds = ["routes", "patterns", "predictions"]

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
    renderRoutesTab(tabContent)

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
      if (tabId === "routes") {
        renderRoutesTab(tabContent)
      } else if (tabId === "patterns") {
        renderPatternsTab(tabContent)
      } else if (tabId === "predictions") {
        renderPredictionsTab(tabContent)
      }
    }
  }

  // Mock data
  const frequentRoutes = [
    { route: "/dashboard", count: 120 },
    { route: "/market-predictions", count: 80 },
    { route: "/favorites", count: 60 },
    { route: "/alerts", count: 40 },
    { route: "/settings", count: 30 },
  ]

  const patterns = [
    { from: "/dashboard", to: "/market-predictions", count: 45, lastVisited: "2023-05-20T10:30:00Z" },
    { from: "/market-predictions", to: "/favorites", count: 32, lastVisited: "2023-05-20T11:15:00Z" },
    { from: "/dashboard", to: "/alerts", count: 28, lastVisited: "2023-05-20T09:45:00Z" },
    { from: "/favorites", to: "/settings", count: 15, lastVisited: "2023-05-20T14:20:00Z" },
  ]

  const routePredictions = {
    "/dashboard": ["/market-predictions", "/alerts", "/favorites"],
    "/market-predictions": ["/favorites", "/dashboard", "/alerts"],
    "/favorites": ["/market-predictions", "/settings", "/dashboard"],
  }

  let selectedRoute = ""

  // Render routes tab
  function renderRoutesTab(container) {
    const grid = document.createElement("div")
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-4"
    container.appendChild(grid)

    frequentRoutes.forEach((item) => {
      const div = document.createElement("div")
      div.className = "p-3 bg-gray-50 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100"
      div.innerHTML = `
        <span class="font-medium truncate">${item.route}</span>
        <span class="text-sm bg-gray-200 px-2 py-1 rounded-full">${item.count} visits</span>
      `
      div.addEventListener("click", () => {
        selectedRoute = item.route
        const predictionsTab = document.querySelector('[data-tab="predictions"]')
        if (predictionsTab) predictionsTab.click()
      })
      grid.appendChild(div)
    })
  }

  // Render patterns tab
  function renderPatternsTab(container) {
    const div = document.createElement("div")
    div.className = "overflow-x-auto"
    container.appendChild(div)

    const table = document.createElement("table")
    table.className = "w-full border-collapse"
    div.appendChild(table)

    const thead = document.createElement("thead")
    table.appendChild(thead)

    const headerRow = document.createElement("tr")
    headerRow.className = "bg-gray-100"
    thead.appendChild(headerRow)
    ;["From", "To", "Count", "Last Visit"].forEach((text) => {
      const th = document.createElement("th")
      th.className = "text-left p-2"
      th.textContent = text
      headerRow.appendChild(th)
    })

    const tbody = document.createElement("tbody")
    table.appendChild(tbody)

    patterns.forEach((pattern) => {
      const row = document.createElement("tr")
      row.className = "border-t hover:bg-gray-50"
      tbody.appendChild(row)

      const fromCell = document.createElement("td")
      fromCell.className = "p-2"
      fromCell.textContent = pattern.from
      row.appendChild(fromCell)

      const toCell = document.createElement("td")
      toCell.className = "p-2"
      toCell.textContent = pattern.to
      row.appendChild(toCell)

      const countCell = document.createElement("td")
      countCell.className = "p-2"
      countCell.textContent = pattern.count.toString()
      row.appendChild(countCell)

      const dateCell = document.createElement("td")
      dateCell.className = "p-2"
      dateCell.textContent = new Date(pattern.lastVisited).toLocaleString()
      row.appendChild(dateCell)
    })
  }

  // Render predictions tab
  function renderPredictionsTab(container) {
    const div = document.createElement("div")
    div.className = "space-y-4"
    container.appendChild(div)

    // Route selector
    const selectorDiv = document.createElement("div")
    selectorDiv.className = "p-4 bg-gray-50 rounded"
    div.appendChild(selectorDiv)

    const selectorTitle = document.createElement("h3")
    selectorTitle.className = "font-medium mb-2"
    selectorTitle.textContent = "Select a route to see predictions"
    selectorDiv.appendChild(selectorTitle)

    const buttonContainer = document.createElement("div")
    buttonContainer.className = "flex flex-wrap gap-2"
    selectorDiv.appendChild(buttonContainer)

    frequentRoutes.forEach((item) => {
      const button = document.createElement("button")
      button.className = `px-3 py-1 rounded ${selectedRoute === item.route ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`
      button.textContent = item.route
      button.addEventListener("click", () => {
        selectedRoute = item.route
        renderPredictionsTab(container)
      })
      buttonContainer.appendChild(button)
    })

    // Predictions or info message
    if (selectedRoute) {
      const predictionsDiv = document.createElement("div")
      predictionsDiv.className = "p-4 border rounded"
      div.appendChild(predictionsDiv)

      const predictionsTitle = document.createElement("h3")
      predictionsTitle.className = "font-medium mb-2"
      predictionsTitle.textContent = `Predictions for ${selectedRoute}`
      predictionsDiv.appendChild(predictionsTitle)

      const predictions = routePredictions[selectedRoute] || []

      if (predictions.length > 0) {
        const predictionsContainer = document.createElement("div")
        predictionsContainer.className = "space-y-2"
        predictionsDiv.appendChild(predictionsContainer)

        predictions.forEach((route, index) => {
          const predictionDiv = document.createElement("div")
          predictionDiv.className = "p-2 bg-blue-50 rounded border border-blue-100"
          predictionDiv.innerHTML = `
            ${route} <span class="text-xs text-blue-600 ml-2">Prediction #${index + 1}</span>
          `
          predictionsContainer.appendChild(predictionDiv)
        })
      } else {
        const noDataMessage = document.createElement("p")
        noDataMessage.className = "text-gray-500"
        noDataMessage.textContent = "No predictions available for this route"
        predictionsDiv.appendChild(noDataMessage)
      }
    } else {
      const infoDiv = document.createElement("div")
      infoDiv.className = "p-4 bg-blue-50 rounded border border-blue-100"
      div.appendChild(infoDiv)

      const infoContent = document.createElement("div")
      infoContent.className = "flex items-start"
      infoDiv.appendChild(infoContent)

      const infoIcon = document.createElement("div")
      infoIcon.className = "text-blue-500 mr-2"
      infoIcon.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `
      infoContent.appendChild(infoIcon)

      const infoText = document.createElement("div")
      infoContent.appendChild(infoText)

      const infoTitle = document.createElement("h3")
      infoTitle.className = "font-medium"
      infoTitle.textContent = "Select a route"
      infoText.appendChild(infoTitle)

      const infoDescription = document.createElement("p")
      infoDescription.className = "text-sm"
      infoDescription.textContent = "Select a route above to see predicted next routes."
      infoText.appendChild(infoDescription)
    }
  }

  // Initialize the UI
  createUI()
})()
