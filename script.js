function calculateEMI(principal, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  return (
    principal * monthlyRate * Math.pow(1 + monthlyRate, months)
  ) / (Math.pow(1 + monthlyRate, months) - 1);
}

function formatINR(num) {
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

// Car price data fetching functions
const CARDEKHO_API_BASE_URL = 'https://api.cardekho.com/v1';
const RAPID_API_KEY = ''; // You'll need to sign up for an API key

// Fetch available car manufacturers from real API
async function fetchManufacturers() {
  try {
    const response = await fetch('https://cdn-api.cardekho.com/v1/makes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.manufacturers || [];
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    // Show error message to user
    document.getElementById('fetchPrices').insertAdjacentHTML('afterend',
      `<p style="color:red; margin-top: 5px;">Failed to fetch manufacturers. Please try again later.</p>`);
    return [];
  }
}

// Fetch models for a specific manufacturer from real API
async function fetchModels(manufacturerId) {
  try {
    const response = await fetch(`https://cdn-api.cardekho.com/v1/models?makeId=${manufacturerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

// Fetch variants for a specific model from real API
async function fetchVariants(manufacturerId, modelId) {
  try {
    const response = await fetch(`https://cdn-api.cardekho.com/v1/variants?modelId=${modelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.variants || [];
  } catch (error) {
    console.error('Error fetching variants:', error);
    return [];
  }
}

// Fetch cities from real API
async function fetchCities() {
  try {
    const response = await fetch('https://cdn-api.cardekho.com/v1/cities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.cities || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

// Fetch real car price data based on selection
async function fetchCarPriceData(variantId, cityId) {
  try {
    const response = await fetch(`https://cdn-api.cardekho.com/v1/variant-details?variantId=${variantId}&cityId=${cityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const variantDetails = data.variantDetails;

    if (!variantDetails) {
      throw new Error('No price data available for the selected car');
    }

    return {
      exShowroomPrice: variantDetails.exShowroomPrice || 0,
      onRoadPrice: variantDetails.onRoadPrice || 0,
      city: cityId,
      name: variantDetails.name || '',
      insurancePrice: variantDetails.insurancePrice || 0
    };
  } catch (error) {
    console.error('Error fetching car prices:', error);
    // Display error message to user
    document.getElementById('fetchPrices').insertAdjacentHTML('afterend',
      `<p style="color:red; margin-top: 5px;">Failed to fetch price data. Please try again later.</p>`);

    // Remove existing error messages after 5 seconds
    setTimeout(() => {
      const errorMessages = document.querySelectorAll('#fetchPrices + p[style*="color:red"]');
      errorMessages.forEach(message => message.remove());
    }, 5000);

    return {
      exShowroomPrice: 0,
      onRoadPrice: 0,
      city: cityId,
      insurancePrice: 0
    };
  }
}

// Fallback method in case the API is unavailable or requires authentication
async function fetchCarDataFallback(manufacturerId, modelId, variantId, cityId) {
  try {
    // Make a GET request to another source or use a publicly accessible endpoint
    const response = await fetch(`https://www.cardekho.com/api/v1/version/${variantId}/price/city/${cityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      exShowroomPrice: data.exShowroomPrice || 0,
      onRoadPrice: data.onRoadPrice || 0,
      city: cityId
    };
  } catch (error) {
    console.error('Error in fallback fetch:', error);

    // If all APIs fail, we'll use web scraping as a last resort
    return await scrapeCarPriceData(manufacturerId, modelId, variantId, cityId);
  }
}

// Web scraping fallback (note: this would require server-side processing in a real implementation)
async function scrapeCarPriceData(manufacturerId, modelId, variantId, cityId) {
  try {
    // In a real implementation, this would call a server-side API that does the scraping
    // Here we'll use a proxy service as example
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = encodeURIComponent(`https://www.cardekho.com/${manufacturerId}-cars/${modelId}/${variantId}`);

    const response = await fetch(`${proxyUrl}${targetUrl}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data through proxy');
    }

    // This would contain the HTML content
    const html = await response.text();

    // In reality, you would need to parse the HTML to extract prices
    // This is just a placeholder - actual implementation would be more complex
    console.log('Fallback to web scraping data retrieval');

    // Using an average multiplier for on-road calculation as fallback
    return {
      exShowroomPrice: 0, // Would be extracted from parsed HTML
      onRoadPrice: 0, // Would be extracted from parsed HTML
      city: cityId
    };
  } catch (error) {
    console.error('Error in web scraping fallback:', error);
    return {
      exShowroomPrice: 0,
      onRoadPrice: 0,
      city: cityId
    };
  }
}

// Initialize UI components for car selection
async function initializeCarSelector() {
  // Create loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loadingIndicator';
  loadingIndicator.style.display = 'none';
  loadingIndicator.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Fetching data...</p>
  `;
  document.querySelector('.container').appendChild(loadingIndicator);

  // Create select elements in the DOM
  const formElement = document.getElementById('carForm');
  const calculatorControls = document.createElement('div');
  calculatorControls.classList.add('calculator-controls');
  calculatorControls.innerHTML = `
    <div class="form-group">
      <label for="carBrand">Car Manufacturer</label>
      <select id="carBrand" required>
        <option value="">Select Manufacturer</option>
      </select>
    </div>
    <div class="form-group">
      <label for="carModel">Car Model</label>
      <select id="carModel" required disabled>
        <option value="">Select Model</option>
      </select>
    </div>
    <div class="form-group">
      <label for="carVariant">Variant</label>
      <select id="carVariant" required disabled>
        <option value="">Select Variant</option>
      </select>
    </div>
    <div class="form-group">
      <label for="city">City</label>
      <select id="city" required>
        <option value="">Select City</option>
      </select>
    </div>
    <button type="button" id="fetchPrices">Fetch Car Prices</button>
  `;

  // Insert the controls before the first input element
  const firstInput = formElement.querySelector('input');
  formElement.insertBefore(calculatorControls, firstInput.parentElement);

  // Populate manufacturers
  const manufacturers = await fetchManufacturers();
  const brandSelect = document.getElementById('carBrand');
  manufacturers.forEach(manufacturer => {
    const option = document.createElement('option');
    option.value = manufacturer.id;
    option.textContent = manufacturer.name;
    brandSelect.appendChild(option);
  });

  // Populate cities
  const cities = await fetchCities();
  const citySelect = document.getElementById('city');
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.id;
    option.textContent = city.name;
    citySelect.appendChild(option);
  });

  // Add event listeners for dropdowns
  brandSelect.addEventListener('change', async function() {
    const modelSelect = document.getElementById('carModel');
    const variantSelect = document.getElementById('carVariant');

    // Reset models and variants
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    variantSelect.innerHTML = '<option value="">Select Variant</option>';

    if (this.value) {
      modelSelect.disabled = false;
      const models = await fetchModels(this.value);
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
      });
    } else {
      modelSelect.disabled = true;
      variantSelect.disabled = true;
    }
  });

  document.getElementById('carModel').addEventListener('change', async function() {
    const manufacturerId = document.getElementById('carBrand').value;
    const variantSelect = document.getElementById('carVariant');

    // Reset variants
    variantSelect.innerHTML = '<option value="">Select Variant</option>';

    if (this.value) {
      variantSelect.disabled = false;
      const variants = await fetchVariants(manufacturerId, this.value);
      variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant.id;
        option.textContent = variant.name;
        variantSelect.appendChild(option);
      });
    } else {
      variantSelect.disabled = true;
    }
  });

  // Add fetch prices button event listener with loading state
  document.getElementById('fetchPrices').addEventListener('click', async function() {
    const manufacturerId = document.getElementById('carBrand').value;
    const modelId = document.getElementById('carModel').value;
    const variantId = document.getElementById('carVariant').value;
    const cityId = document.getElementById('city').value;

    if (!manufacturerId || !modelId || !variantId || !cityId) {
      alert('Please select all car details and city');
      return;
    }

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'flex';
    this.disabled = true;

    try {
      // Try to fetch data from primary API
      const priceData = await fetchCarPriceData(variantId, cityId);

      // If the primary API returned valid data
      if (priceData.exShowroomPrice > 0 && priceData.onRoadPrice > 0) {
        document.getElementById('exShowroom').value = priceData.exShowroomPrice;
        document.getElementById('onRoad').value = priceData.onRoadPrice;

        // If insurance data available, update that field too
        if (priceData.insurancePrice > 0) {
          document.getElementById('insurance').value = priceData.insurancePrice;
        }

        // Display success message
        this.insertAdjacentHTML('afterend',
          `<p style="color:green; margin-top: 5px;">Successfully fetched latest prices!</p>`);

        // Remove success message after 3 seconds
        setTimeout(() => {
          const successMessages = document.querySelectorAll('#fetchPrices + p[style*="color:green"]');
          successMessages.forEach(message => message.remove());
        }, 3000);
      } else {
        // If primary API failed, try fallback
        console.log('Primary API returned incomplete data, trying fallback...');
        const fallbackData = await fetchCarDataFallback(manufacturerId, modelId, variantId, cityId);

        if (fallbackData.exShowroomPrice > 0 || fallbackData.onRoadPrice > 0) {
          document.getElementById('exShowroom').value = fallbackData.exShowroomPrice;
          document.getElementById('onRoad').value = fallbackData.onRoadPrice;
        } else {
          // If all methods failed, display error message
          this.insertAdjacentHTML('afterend',
            `<p style="color:red; margin-top: 5px;">Could not fetch price data. Please enter prices manually.</p>`);
        }
      }
    } catch (error) {
      console.error('Error fetching car price data:', error);
      this.insertAdjacentHTML('afterend',
        `<p style="color:red; margin-top: 5px;">Failed to fetch price data: ${error.message}</p>`);
    } finally {
      // Hide loading indicator and re-enable button
      document.getElementById('loadingIndicator').style.display = 'none';
      this.disabled = false;

      // Remove any error or success messages after 5 seconds
      setTimeout(() => {
        const messages = document.querySelectorAll('#fetchPrices + p');
        messages.forEach(message => message.remove());
      }, 5000);
    }
  });
}

// Initialize car selector when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeCarSelector();
});

document.getElementById('carForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const exShowroom = parseFloat(document.getElementById('exShowroom').value);
  const onRoad = parseFloat(document.getElementById('onRoad').value);
  const tenure = parseInt(document.getElementById('tenure').value, 10);
  const downpayment = parseFloat(document.getElementById('downpayment').value) || 0;
  const annualInsurance = parseFloat(document.getElementById('insurance').value) || 0;
  const annualInterestRate = 9.5;
  const annualInterestRateOnRoad = 8.5;

  if (
    isNaN(exShowroom) || exShowroom <= 0 ||
    isNaN(onRoad) || onRoad <= 0 ||
    isNaN(tenure) || tenure <= 0 ||
    downpayment < 0 ||
    downpayment >= exShowroom ||
    downpayment >= onRoad ||
    annualInsurance < 0
  ) {
    document.getElementById('result').innerHTML = `<p style="color:red;">Please enter valid values. Downpayment must be less than both prices.</p>`;
    return;
  }

  const netExShowroom = exShowroom - downpayment;
  const netOnRoad = onRoad - downpayment;
  const emiExShowroom = calculateEMI(netExShowroom, annualInterestRate, tenure);
  const emiOnRoad = calculateEMI(netOnRoad, annualInterestRateOnRoad, tenure);
  const residualValueExShowroom = netExShowroom * 0.20;
  const totalInsuranceCost = annualInsurance * (tenure - 1);
  const totalCostExShowroom = (emiExShowroom * tenure * 12) + downpayment + residualValueExShowroom;
  const totalCostOnRoad = (emiOnRoad * tenure * 12) + downpayment + totalInsuranceCost;
  const savings = totalCostOnRoad - totalCostExShowroom;

  document.getElementById('result').innerHTML = `
    <h3>Ex-Showroom Purchase</h3>
    <p><b>EMI:</b> ${formatINR(emiExShowroom)}</p>
    <p><b>Residual Value:</b> ${formatINR(residualValueExShowroom)}</p>
    <p><b>Total Cost (EMI + Downpayment + Residual Value):</b> ${formatINR(totalCostExShowroom)}</p>
    <hr>
    <h3>On-Road Purchase</h3>
    <p><b>EMI:</b> ${formatINR(emiOnRoad)}</p>
    <p><b>Insurance (Years 2-${tenure}):</b> ${formatINR(totalInsuranceCost)}</p>
    <p><b>Total Cost (EMI + Downpayment + Insurance):</b> ${formatINR(totalCostOnRoad)}</p>
    <hr>
    <h3>Comparison</h3>
    <p><b>Savings (On-Road vs Ex-Showroom):</b> ${formatINR(savings)}</p>
  `;
});