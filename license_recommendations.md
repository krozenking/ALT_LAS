# License Compatibility Report & Recommendations for ALT_LAS Project

## Summary
Analysis of dependencies reveals that **most core components use licenses compatible with closed-source commercial use (MIT, BSD, Apache 2.0)**. However, certain components mentioned in the architecture, specifically **Grafana (AGPLv3)** for monitoring and **Coqui TTS (MPL 2.0)** for voice processing, present potential licensing conflicts with the project's commercial goals. Immediate attention and decisions are required regarding these components.

## Core Dependencies and License Status (Compatible ✅)

### API Gateway (Node.js)
- All dependencies use the MIT license.

### Segmentation Service (Python)
- Dependencies use MIT or BSD licenses.

### Runner Service (Rust)
- Dependencies primarily use MIT/Apache 2.0 licenses.

### Archive Service (Go)
- Dependencies primarily use BSD-3-Clause/Apache 2.0/PostgreSQL License.

### UI Components (React, Electron, React Native)
- Dependencies primarily use the MIT license.

### OS Integration (Rust/C++)
- Dependencies primarily use MIT/Apache 2.0 licenses.

### AI Orchestrator, Local LLM, Computer Vision (Python, C++)
- Dependencies primarily use MIT, BSD, Apache 2.0 licenses.

## Potential Licensing Issues & Recommendations (Action Required ⚠️)

1.  **Grafana (Monitoring):**
    *   **License:** AGPLv3
    *   **Issue:** AGPL is a strong copyleft (viral) license. If Grafana is modified and offered as a service, or potentially even tightly integrated and distributed, it could require the entire project's source code to be released under AGPL.
    *   **Recommendation:**
        *   **Option A (Preferred for Commercial):** Use the MIT-licensed alternative **Chronograf** mentioned in `architecture.md` if its features suffice.
        *   **Option B (Requires Legal Review):** Use Grafana strictly internally without modification or distribution, *after* obtaining legal counsel confirming this usage doesn't trigger AGPL obligations for the rest of the project.
        *   **Decision Needed:** Choose between Chronograf, using Grafana with legal review, or finding another permissively licensed alternative.

2.  **Coqui TTS (Voice Processing):**
    *   **License:** MPL 2.0
    *   **Issue:** MPL 2.0 requires modifications made to MPL-licensed *files* to be shared under MPL. While not as viral as AGPL, it can complicate proprietary development if modifications to Coqui TTS code itself are needed.
    *   **Recommendation:**
        *   **Option A (Preferred for Commercial):** Replace Coqui TTS with a permissively licensed alternative like **Piper TTS (MIT)** as suggested in `architecture.md`.
        *   **Option B (Less Ideal):** Use Coqui TTS without modifying its source files, ensuring a clear boundary between it and proprietary code. This might limit flexibility.
        *   **Decision Needed:** Confirm the switch to Piper TTS or another MIT/Apache/BSD licensed alternative.

## General License Compliance Requirements

For all included third-party libraries, ensure the following:

- **Attribution:** Include original copyright notices.
- **License Text:** Include the full text of the applicable licenses (MIT, BSD, Apache 2.0, etc.) in your software distribution (e.g., in a "licenses" or "third-party notices" file).
- **Specific Restrictions:** Adhere to any specific clauses (e.g., BSD's non-endorsement clause).

## Recommendations for Future Development

1.  **Strict License Vetting**: Before adding *any* new dependency, verify its license is compatible (MIT, Apache 2.0, BSD preferred). Avoid GPL/AGPL/MPL unless explicitly approved after legal review.
2.  **Automated License Scanning**: Integrate tools like FOSSA, Snyk Open Source, or trivy into the CI/CD pipeline to automatically scan for license compliance issues.
3.  **Maintain License Documentation**: Keep `license_analysis.md` up-to-date with all dependencies and their licenses.
4.  **Dependency Review**: Periodically review dependencies for license changes or vulnerabilities.

## Conclusion
The core of the ALT_LAS project is built on commercially friendly licenses. However, **immediate decisions are required regarding Grafana and Coqui TTS** to ensure the entire project remains compatible with closed-source commercial distribution goals. Replacing them with permissively licensed alternatives (Chronograf, Piper TTS) is the safest path.
