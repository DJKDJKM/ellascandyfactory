// Mock DOM setup for unit tests
function setupDOMEnvironment() {
  document.body.innerHTML = `
    <div class="game-container">
      <h1>Ella's Candy Factory</h1>
      <div class="factory-area">
        <div class="ingredients-section">
          <h2>Ingredients</h2>
          <div class="ingredient-buttons">
            <button data-ingredient="sugar" class="ingredient">Sugar</button>
            <button data-ingredient="chocolate" class="ingredient">Chocolate</button>
            <button data-ingredient="strawberry" class="ingredient">Strawberry</button>
            <button data-ingredient="blueberry" class="ingredient">Blueberry</button>
          </div>
        </div>
        <div class="mixing-bowl">
          <h2>Mixing Bowl</h2>
          <div class="bowl">
            <div id="bowl-contents"></div>
          </div>
          <div class="control-buttons">
            <button id="mix-button">Mix</button>
            <button id="reset-button">Reset</button>
          </div>
        </div>
        <div class="candy-result">
          <h2>Candy</h2>
          <div id="candy-display"></div>
          <button id="package-button" disabled>Package</button>
        </div>
      </div>
      <div class="shop-area">
        <div class="packaged-candy-section">
          <h2>Packaged Candy</h2>
          <div id="packaged-candies"></div>
          <button id="sell-button" disabled>Sell</button>
        </div>
        <div class="upgrades-section">
          <h2>Upgrades</h2>
          <div id="upgrades">
            <div id="faster-mixing" class="upgrade">
              <h3>Faster Mixing</h3>
              <p>Mix candies faster</p>
              <p>Price: $<span class="price">50</span></p>
              <button class="buy-upgrade">Buy</button>
            </div>
            <div id="bigger-bowl" class="upgrade">
              <h3>Bigger Bowl</h3>
              <p>Mix more ingredients at once</p>
              <p>Price: $<span class="price">100</span></p>
              <button class="buy-upgrade">Buy</button>
            </div>
          </div>
        </div>
      </div>
      <div class="customer-area">
        <h2>Customers</h2>
        <div id="customer-display"></div>
      </div>
      <div class="game-controls">
        <div class="money-display">
          <h2>Money: $<span id="money">0</span></h2>
        </div>
        <div class="timer-display">
          <h2>Time: <span id="timer">3:00</span></h2>
        </div>
      </div>
    </div>
  `;
  
  // Mock localStorage
  const localStorageMock = (function() {
    let store = {};
    return {
      getItem: function(key) {
        return store[key] || null;
      },
      setItem: function(key, value) {
        store[key] = value.toString();
      },
      clear: function() {
        store = {};
      },
      removeItem: function(key) {
        delete store[key];
      }
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  // Mock alert
  window.alert = jest.fn();

  return { localStorageMock };
}

module.exports = { setupDOMEnvironment };
