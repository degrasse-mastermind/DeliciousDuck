import {mediaLibrary} from "../media/library";

const slot = mediaLibrary.technicalProbePlacement;
const specimen = slot.specimen;

const failures: string[] = [];
if (specimen.requiredSource.width !== 2400 || specimen.requiredSource.height !== 3000) failures.push("Required master must be 2400x3000.");
if (specimen.requiredSource.format !== "PNG" || specimen.requiredSource.colorSpace !== "sRGB") failures.push("Required master must be an sRGB PNG.");
if (specimen.optionalLayeredSource.viewBox !== "0 0 2400 3000") failures.push("Layered SVG viewBox must match the master.");
if (specimen.overlayGeometry.safeTextArea.width !== 1008) failures.push("Left safe-text field must equal 42% of 2400 px.");
for (const forbidden of ["typography", "logo", "temperatures", "measurements", "labels", "callouts", "arrows", "explanatory copy"]) {
  if (!specimen.forbiddenSourceContent.includes(forbidden)) failures.push(`Missing forbidden-content rule: ${forbidden}.`);
}
for (const group of ["breast", "probe", "probe-path-registration", "target-registration"]) {
  if (!specimen.optionalLayeredSource.groupIds.includes(group)) failures.push(`Missing SVG group contract: ${group}.`);
}
if (failures.length) throw new Error(failures.join("\n"));

process.stdout.write(`PASS ${specimen.specimenId}: slot contract is valid; source artwork remains ${slot.approval}.\n`);
