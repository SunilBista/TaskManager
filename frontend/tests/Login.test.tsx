import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Login from "../src/components/Login";
import { describe, test, expect, vi } from "vitest";

// Import jest-dom for custom matchers
import "@testing-library/jest-dom";

describe("Login Component", () => {
  test("renders login form", () => {
    render(<Login />);

    // Ensure email and password fields are present
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Ensure the login button is present
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("button click calls console.log", () => {
    // Mock console.log
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<Login />);

    // Fire a click event on the login button
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Ensure console.log is called
    expect(logSpy).toHaveBeenCalledWith("test");

    // Restore the original console.log
    logSpy.mockRestore();
  });

  test("can type in email and password fields", () => {
    render(<Login />);

    // Simulate typing into the email input
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Simulate typing into the password input
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    // Ensure the email and password fields contain the correct values
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue(
      "test@example.com"
    );
    expect(screen.getByPlaceholderText(/password/i)).toHaveValue("password123");
  });
});
