import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FoodItem {
  foodId: string;
  foodName: string;
  foodPrice: number;
}

interface OrderRequestItem {
  productId: string;
  quantity: number;
}

// Define possible API response structures
interface ApiResponseFood {
  data?: FoodItem[];
  status?: string;
  message?: string;
  [key: string]: any; // Allow for other properties
}

const CustomerOrder: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderItems, setOrderItems] = useState<OrderRequestItem[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorFood, setErrorFood] = useState<string | null>(null);

  // Fetch food items on mount
  useEffect(() => {
    axios.get('http://localhost:5229/api/Food/GetFoodInformation')
      .then(response => {
        // Log the full response for debugging
        console.log('Full API Response:', response);
        // Check for nested data
        let items = response.data as ApiResponseFood;
        if (Array.isArray(items)) {
          setFoodItems(items);
        } else if (items && typeof items === 'object') {
          // Safely extract nested array
          const foodData = items.data || [];
          if (Array.isArray(foodData)) {
            setFoodItems(foodData);
          } else {
            console.error('No valid array found in response:', response.data);
            setErrorFood('Invalid food items data format');
            setFoodItems([]);
          }
        } else {
          console.error('Unexpected API response format:', response.data);
          setErrorFood('Invalid food items data format');
          setFoodItems([]);
        }
      })
      .catch(error => {
        console.error('Error fetching food items:', error);
        setErrorFood('Failed to fetch food items');
        setFoodItems([]);
      });
  }, []);

  const handleAddItem = () => {
    if (selectedFoodId) {
      setOrderItems([...orderItems, { productId: selectedFoodId, quantity }]);
      setSelectedFoodId('');
      setQuantity(1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerEmail) {
      alert('Please enter a customer email');
      return;
    }

    const orderData = {
      customerEmail,
      orderDate: new Date().toISOString(),
      orderRequestItems: orderItems
    };

    try {
      const userId = localStorage.getItem('IDND');
      await axios.post(
        `http://localhost:5229/api/StaffOrder/StaffOrder?UserId=${userId}`,
        orderData,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );
      setOrderItems([]);
      setCustomerEmail('');
      alert('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Error Message */}
      {errorFood && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
          {errorFood}
        </div>
      )}

      {/* Order Form */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-4">New Order</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer Email</label>
          <input
            type="text"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter customer email"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Order Date</label>
          <input
            type="text"
            value={new Date().toLocaleDateString()}
            disabled
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Food Item</label>
          <div className="flex gap-2">
            <select
              className="w-full p-2 border rounded-md"
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
            >
              <option value="">Select a food item</option>
              {Array.isArray(foodItems) && foodItems.length > 0 ? (
                foodItems.map((item) => (
                  <option key={item.foodId} value={item.foodId}>{item.foodName}</option>
                ))
              ) : (
                <option disabled>No food items available</option>
              )}
            </select>
            <select
              className="w-24 p-2 border rounded-md"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <button
              className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
              onClick={handleAddItem}
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Items List */}
        {orderItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Selected Items</h3>
            <ul className="list-disc pl-5">
              {orderItems.map((item, index) => {
                const food = foodItems.find(f => f.foodId === item.productId);
                return (
                  <li key={index}>
                    {food?.foodName || 'Unknown Item'} - Quantity: {item.quantity}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
            onClick={() => {
              setOrderItems([]);
              setCustomerEmail('');
            }}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleSubmitOrder}
            disabled={orderItems.length === 0}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder;