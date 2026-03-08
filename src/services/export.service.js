/**
 * @fileoverview Export Service — Epic 3.8 (ESG Export Reports)
 * @description Generates CSV and PDF export files for ESG trip data.
 *   - Validates date range (max 1 year / ESG_EXPORT_MAX_DAYS)
 *   - CSV: native Node.js string builder (no external deps)
 *   - PDF: structured plain-text layout (no binary deps required by core)
 *   - Designed for async / streaming exports when dataset is large
 * @module services/export.service
 */

import Trip from '../models/Trip.js';
import { ESG_EXPORT_MAX_DAYS } from '../config/esgConstants.js';

// ─── Date Range Validation ────────────────────────────────────────────────────

/**
 * Validate that a date range does not exceed ESG_EXPORT_MAX_DAYS.
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @throws {Error} When range is invalid or exceeds 1 year
 */
export const validateExportDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end   = new Date(endDate);

  if (isNaN(start.getTime())) throw new Error('startDate is invalid');
  if (isNaN(end.getTime()))   throw new Error('endDate is invalid');
  if (start > end)            throw new Error('startDate must be before endDate');

  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > ESG_EXPORT_MAX_DAYS) {
    throw new Error(`Export date range cannot exceed ${ESG_EXPORT_MAX_DAYS} days (1 year). Requested: ${Math.ceil(diffDays)} days.`);
  }
};

// ─── Data Fetching ────────────────────────────────────────────────────────────

/**
 * Fetch completed trips for a given scope within a date range.
 *
 * @param {Object} params
 * @param {string|null}  params.organizationId - Filter by org (null = all, platform admin)
 * @param {string}       params.startDate
 * @param {string}       params.endDate
 * @param {string|null}  params.driverId       - Filter by driver (null = all in scope)
 * @returns {Promise<Array>} Array of lean trip documents
 */
const fetchTripsForExport = async ({ organizationId, startDate, endDate, driverId }) => {
  validateExportDateRange(startDate, endDate);

  const matchStage = {
    status: 'COMPLETED',
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  };

  if (driverId)        matchStage.driverId = driverId;

  let pipeline = [{ $match: matchStage }];

  // Org-scope filter via join
  if (organizationId) {
    pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'driverId',
          foreignField: '_id',
          as: '_driver',
        },
      },
      { $unwind: '$_driver' },
      {
        $match: {
          '_driver.organizationId': organizationId,
          ...matchStage,
        },
      },
      { $project: { _driver: 0 } },
    ];
  }

  return Trip.aggregate(pipeline).allowDiskUse(true);
};

// ─── CSV Export (3.8) ─────────────────────────────────────────────────────────

const CSV_COLUMNS = [
  { key: '_id',                    label: 'Trip ID' },
  { key: 'scheduledTime',          label: 'Scheduled Time' },
  { key: 'status',                 label: 'Status' },
  { key: 'vehicleType',            label: 'Vehicle Type' },
  { key: 'fuelType',               label: 'Fuel Type' },
  { key: 'distanceKm',             label: 'Distance (km)' },
  { key: 'co2SavedKg',             label: 'CO2 Saved (kg)' },
  { key: 'treesEquivalent',        label: 'Trees Equivalent' },
  { key: 'carpoolSavingsKg',       label: 'Carpool Savings (kg CO2)' },
  { key: 'soloBaselineCo2Kg',      label: 'Solo Baseline CO2 (kg)' },
  { key: 'routeEfficiencyScore',   label: 'Route Efficiency (1-5)' },
  { key: 'idleEmissionsKg',        label: 'Idle Emissions (kg)' },
  { key: 'fuelCostSavingsINR',     label: 'Fuel Cost Savings (INR)' },
  { key: 'maintenanceSavingsINR',  label: 'Maintenance Savings (INR)' },
  { key: 'totalSeats',             label: 'Total Seats' },
  { key: 'availableSeats',         label: 'Available Seats' },
  { key: 'estimatedCost',          label: 'Estimated Cost (INR)' },
];

/**
 * Escape a CSV cell value.
 * @param {*} value
 * @returns {string}
 */
const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generate a CSV string for trip ESG data.
 *
 * @param {Object} params
 * @param {string|null} params.organizationId
 * @param {string}      params.startDate
 * @param {string}      params.endDate
 * @param {string|null} [params.driverId]
 * @returns {Promise<{csv: string, recordCount: number}>}
 */
export const generateCsvExport = async ({ organizationId, startDate, endDate, driverId = null }) => {
  const trips = await fetchTripsForExport({ organizationId, startDate, endDate, driverId });

  const header = CSV_COLUMNS.map(c => escapeCsvCell(c.label)).join(',');
  const rows   = trips.map(trip =>
    CSV_COLUMNS.map(c => escapeCsvCell(trip[c.key])).join(',')
  );

  const csv = [header, ...rows].join('\n');
  console.log(`[export.service] CSV generated: ${trips.length} records`);
  return { csv, recordCount: trips.length };
};

// ─── PDF Export (3.8) ─────────────────────────────────────────────────────────

/**
 * Generate a structured text-based PDF content for ESG reports.
 * Returns a plain-text string formatted as a report (printable / downloadable).
 * For binary PDF generation, integrate pdfkit as a future enhancement.
 *
 * @param {Object} params - Same as generateCsvExport
 * @returns {Promise<{content: string, recordCount: number}>}
 */
export const generatePdfExport = async ({ organizationId, startDate, endDate, driverId = null }) => {
  const trips = await fetchTripsForExport({ organizationId, startDate, endDate, driverId });

  const lines = [
    '========================================',
    '    GreenCommute ESG Impact Report',
    '========================================',
    `Generated : ${new Date().toISOString()}`,
    `Period    : ${startDate} to ${endDate}`,
    `Records   : ${trips.length}`,
    '----------------------------------------',
    '',
  ];

  trips.forEach((trip, i) => {
    lines.push(`[Trip ${i + 1}]  ID: ${trip._id}`);
    lines.push(`  Scheduled   : ${trip.scheduledTime ?? 'N/A'}`);
    lines.push(`  Vehicle     : ${trip.vehicleType ?? 'N/A'} / ${trip.fuelType ?? 'N/A'}`);
    lines.push(`  Distance    : ${trip.distanceKm ?? 'N/A'} km`);
    lines.push(`  CO2 Saved   : ${trip.co2SavedKg ?? 'N/A'} kg`);
    lines.push(`  Trees       : ${trip.treesEquivalent ?? 'N/A'}`);
    lines.push(`  Efficiency  : ${trip.routeEfficiencyScore ?? 'N/A'} / 5`);
    lines.push(`  Fuel Saving : ₹${trip.fuelCostSavingsINR ?? 'N/A'}`);
    lines.push(`  Maint. Save : ₹${trip.maintenanceSavingsINR ?? 'N/A'}`);
    lines.push('');
  });

  lines.push('========================================');
  lines.push('   END OF REPORT');
  lines.push('========================================');

  console.log(`[export.service] PDF content generated: ${trips.length} records`);
  return { content: lines.join('\n'), recordCount: trips.length };
};
