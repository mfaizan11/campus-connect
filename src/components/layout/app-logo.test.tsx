import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppLogo } from './app-logo';
import '@testing-library/jest-dom';

describe('AppLogo Component', () => {
  it('renders the logo text "CampusConnect"', () => {
    render(<AppLogo />);
    expect(screen.getByText('CampusConnect')).toBeInTheDocument();
  });

  it('renders as a link pointing to the homepage "/"', () => {
    render(<AppLogo />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/');
  });

  it('contains an SVG element (for the GraduationCap icon)', () => {
    render(<AppLogo />);
    const linkElement = screen.getByRole('link');
    const svgElement = linkElement.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies correct styling classes for branding', () => {
    render(<AppLogo />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveClass('text-primary'); // Check for primary color class
    // You can add more specific class checks if needed
  });
});
