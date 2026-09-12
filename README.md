# CarbonTrace AI

## Trace. Verify. Reduce.

CarbonTrace AI is a transportation emissions tracking, verification, and reduction platform designed to help organizations measure and manage Scope 3 Category 4 — Upstream Transportation and Distribution emissions.

The platform transforms shipment data into traceable carbon insights, introduces a human-in-the-loop verification workflow, and identifies opportunities to reduce transportation-related emissions.

## Problem

Organizations often struggle to accurately track transportation-related Scope 3 emissions because shipment information is scattered across systems, emissions calculations are performed manually, and reported values may lack verification and auditability.

CarbonTrace addresses these challenges by providing a centralized workflow for collecting, calculating, verifying, auditing, and reducing transportation emissions.

## Solution

CarbonTrace follows a simple workflow:

**TRACE → VERIFY → REDUCE**

### TRACE

CarbonTrace captures shipment-level transportation data including:

- Origin
- Destination
- Supplier
- Weight
- Distance
- Transportation mode
- Emission factor

Users can enter shipment information manually, upload CSV files, or provide shipment information through text parsing.

Emissions are calculated using:

```text
Emissions (kg CO2e)
= Weight (tonnes)
× Distance (km)
× Emission Factor (kg CO2e / tonne-km)
