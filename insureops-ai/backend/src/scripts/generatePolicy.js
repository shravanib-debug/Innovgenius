const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', '..', 'docs', 'Sample_Insurance_Policy.pdf');
const docsDir = path.dirname(outputPath);

if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(outputPath));

// Title
doc.fontSize(25).text('InsureOps Comprehensive Policy Document', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Policy Number: IO-2024-AUTO-HOME-001', { align: 'center' });
doc.text('Effective Date: January 1, 2024', { align: 'center' });
doc.moveDown();

// Section 1: Auto Coverage
doc.fontSize(18).text('Section 1: Auto Coverage', { underline: true });
doc.moveDown();
doc.fontSize(12).text(`
1.1 Collision Coverage
We cover accidental loss or damage to your insured vehicle caused by collision with another object or vehicle.
Coverage Limit: Up to actual cash value (ACV) of the vehicle.
Deductible: $500 per occurrence.

1.2 Comprehensive Coverage
We cover loss or damage to your insured vehicle caused by other than collision, such as:
- Fire, theft, or larceny
- Windstorm, hail, water, or flood
- Vandalism or malicious mischief
- Contact with bird or animal
- Glass breakage
Deductible: $250 per occurrence.

1.3 Exclusions
This policy does not apply to:
- Loss due to normal wear and tear, freezing, mechanical or electrical breakdown.
- Loss to any electronic equipment designed for the reproduction of sound, unless permanently installed.
- Loss caused by war, civil war, insurrection, rebellion, or revolution.
`);
doc.moveDown();

// Section 2: Homeowners Coverage
doc.fontSize(18).text('Section 2: Homeowners Coverage', { underline: true });
doc.moveDown();
doc.fontSize(12).text(`
2.1 Dwelling Protection
We cover the dwelling on the "residence premises" shown in the Declarations, including structures attached to the dwelling.
Coverage Limit: $500,000.

2.2 Personal Property
We cover personal property owned or used by an "insured" while it is anywhere in the world.
Coverage Limit: $250,000 (50% of Dwelling limit).
Special Limits of Liability:
- $200 on money, bank notes, bullion, gold other than goldware, silver other than silverware.
- $1,500 on securities, accounts, deeds, evidences of debt.
- $1,500 on watercraft of all types, including their trailers, furnishings, equipment and outboard engines or motors.
- $1,500 on theft of jewelry, watches, furs, precious and semi-precious stones.

2.3 Perils Insured Against
We ensure against direct physical loss to property described in Coverages A and B caused by the following perils:
1. Fire or Lightning
2. Windstorm or Hail (Excluding loss to the interior of a building caused by rain, snow, sleet, sand or dust unless the direct force of wind or hail damages the building causing an opening in a roof or wall)
3. Explosion
4. Riot or Civil Commotion
5. Aircraft
6. Vehicles
7. Smoke
8. Vandalism or Malicious Mischief
9. Theft
10. Falling Objects
11. Weight of Ice, Snow or Sleet

2.4 Exclusions (IMPORTANT)
We do NOT insure for loss caused directly or indirectly by any of the following:
- Water Damage Analysis: Flood, surface water, waves, tidal water, overflow of a body of water, or spray from any of these, whether or not driven by wind. (Flood insurance must be purchased separately).
- Earth Movement: Earthquake, land shock waves or tremors before, during or after a volcanic eruption, landslide, mudslide, mudflow, subsidence or sinkhole.
- Power Failure: Failure of power or other utility service if the failure takes place off the "residence premises".
- Neglect: Neglect of the "insured" to use all reasonable means to save and preserve property at and after the time of a loss.
- War: War, including undeclared war, civil war, insurrection, rebellion, revolution, warlike act by a military force or military personnel, destruction or seizure or use for a military purpose, and including any consequence of any of these.
- Nuclear Hazard: Nuclear reaction, radiation, or radioactive contamination, all whether controlled or uncontrolled or however caused, or any consequence of any of these.
`);

doc.end();
console.log(`PDF created at: ${outputPath}`);
