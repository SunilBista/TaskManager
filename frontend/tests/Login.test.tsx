import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Login from "../src/components/Login";
import { describe, test, expect, vi } from "vitest";

import "@testing-library/jest-dom";

describe("Login Component", () => {
  test("renders login form", () => {
    render(<Login />);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("button click calls console.log", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(logSpy).toHaveBeenCalledWith("test");

    logSpy.mockRestore();
  });

  test("can type in email and password fields", () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    expect(screen.getByPlaceholderText(/email/i)).toHaveValue(
      "test@example.com"
    );
    expect(screen.getByPlaceholderText(/password/i)).toHaveValue("password123");
  });
});
