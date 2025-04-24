// src/stories/components/Button/Button.stories.tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
// Adjust path relative to the stories directory
import { Button } from "../../../components/Button/Button";

// Example Icon Component (replace with your actual icon library or SVGs)
const IconPlaceholder = ({ className = "" }: { className?: string }) => (
  <svg
    className={`h-5 w-5 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    ></path>
  </svg>
);

const meta: Meta<typeof Button> = {
  title: "Components/Button", // Structure in Storybook sidebar
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "ghost"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    onClick: { action: "clicked" },
    // Use 'object' control for ReactNode complex types if needed,
    // but for simple placeholders, text might suffice for demo.
    // For real icons, you might not need controls or use a select.
    leftIcon: { control: false }, // Disable control for complex nodes initially
    rightIcon: { control: false }, // Disable control for complex nodes initially
  },
  args: {
    // Default args
    variant: "primary",
    size: "md",
    isLoading: false,
    disabled: false,
    children: "Button Text",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Individual stories
export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } }; // Default, but explicit is fine
export const Large: Story = { args: { size: "lg" } };

export const WithLeftIcon: Story = {
  args: {
    children: "Left Icon",
    leftIcon: <IconPlaceholder />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Right Icon",
    rightIcon: <IconPlaceholder />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Icons",
    leftIcon: <IconPlaceholder className="text-green-400" />,
    rightIcon: <IconPlaceholder className="text-red-400" />,
  },
};

export const IsLoading: Story = {
  args: {
    children: "Processing", // Text helps screen readers even if spinner shows
    isLoading: true,
    variant: "primary",
  },
};

export const LoadingWithIcon: Story = {
  args: {
    children: "Processing",
    isLoading: true,
    leftIcon: <IconPlaceholder />, // Icon should ideally be hidden when loading
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Cannot Click",
    disabled: true,
    variant: "primary",
  },
};
