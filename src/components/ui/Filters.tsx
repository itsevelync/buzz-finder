"use client";

import { useState } from "react";
import { CATEGORY_KEYS } from "@/constants/Categories";

function TimeFilter() {
  const [selectedTime, setSelectedTime] = useState("");

  const handleChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleReset = () => {
    setSelectedTime("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>Time</p>
      <label>
        <input
          type="radio"
          name="time"
          value="24hour"
          checked={selectedTime === "24hour"}
          onChange={handleChange}
        />
        24 hours
      </label>
      <br />
      <label>
        <input
          type="radio"
          name="time"
          value="3days"
          checked={selectedTime === "3days"}
          onChange={handleChange}
        />
        3 days
      </label>
      <br />
      <label>
        <input
          type="radio"
          name="time"
          value="1week"
          checked={selectedTime === "1week"}
          onChange={handleChange}
        />
        1 week
      </label>
      <br />
      <button type="submit">Apply</button>
    </form>
  );
}

function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleReset = () => {
    setSelectedTime("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>Time</p>
      <label>
        <input
          type="radio"
          name="time"
          value="24hour"
          checked={selectedTime === "24hour"}
          onChange={handleChange}
        />
        24 hours
      </label>
      <br />
      <label>
        <input
          type="radio"
          name="time"
          value="3days"
          checked={selectedTime === "3days"}
          onChange={handleChange}
        />
        3 days
      </label>
      <br />
      <label>
        <input
          type="radio"
          name="time"
          value="1week"
          checked={selectedTime === "1week"}
          onChange={handleChange}
        />
        1 week
      </label>
      <br />
      <button type="submit">Apply</button>
    </form>
  );
}

export default function Filters() {
  <TimeFilter />;
}
