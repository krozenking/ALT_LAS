# License Analysis for ALT_LAS Project

## Overview
This document analyzes the licenses of all dependencies used in the ALT_LAS project to ensure compatibility with closed-source commercial use.

## API Gateway Dependencies (Node.js)
| Package | Version | License | Commercial Use Compatible? |
|---------|---------|---------|---------------------------|
| express | ^4.18.2 | MIT | Yes ✅ |
| cors | ^2.8.5 | MIT | Yes ✅ |
| helmet | ^7.1.0 | MIT | Yes ✅ |
| jsonwebtoken | ^9.0.2 | MIT | Yes ✅ |
| morgan | ^1.10.0 | MIT | Yes ✅ |
| swagger-ui-express | ^5.0.0 | MIT | Yes ✅ |
| yamljs | ^0.3.0 | MIT | Yes ✅ |
| jest (dev) | ^29.7.0 | MIT | Yes ✅ |
| nodemon (dev) | ^3.0.2 | MIT | Yes ✅ |
| supertest (dev) | ^6.3.3 | MIT | Yes ✅ |

## Segmentation Service Dependencies (Python)
| Package | Version | License | Commercial Use Compatible? |
|---------|---------|---------|---------------------------|
| fastapi | 0.104.1 | MIT | Yes ✅ |
| pydantic | 2.4.2 | MIT | Yes ✅ |
| uvicorn | 0.23.2 | BSD | Yes ✅ |
| pyparsing | 3.1.1 | MIT | Yes ✅ |

## License Compatibility Summary

### MIT License
The MIT License is highly permissive and compatible with closed-source commercial use. It allows:
- Commercial use
- Modification
- Distribution
- Private use
- Sublicensing

The only requirement is to include the original copyright notice and license text in any copy of the software or substantial portion of it.

### BSD License
The BSD License (used by uvicorn) is also permissive and compatible with closed-source commercial use. It allows:
- Commercial use
- Modification
- Distribution
- Private use

Requirements include:
- Including the original copyright notice
- Including the license text
- Not using the names of the copyright holders or contributors to endorse derived products without permission



## Other Potential Dependencies (Mentioned in architecture.md)
| Component/Tool | License | Commercial Use Compatible? | Notes |
|----------------|---------|---------------------------|-------|
| Grafana | AGPLv3 | ⚠️ No (Viral) | Used for monitoring. AGPL requires source code disclosure if modified and offered as a service. Using it internally might be okay, but distribution/SaaS is problematic. |
| Chronograf | MIT | Yes ✅ | Mentioned as an MIT-licensed alternative to Grafana. |
| Coqui TTS | MPL 2.0 | ⚠️ No (File-level copyleft) | Used for Voice Processing Service. MPL 2.0 requires modifications to MPL-licensed files to be shared. Not ideal for closed-source commercial use. |
| Piper TTS | MIT | Yes ✅ | Potential MIT-licensed alternative to Coqui TTS. |

## Updated License Compatibility Summary

Most core dependencies use permissive licenses (MIT, BSD, Apache 2.0) compatible with closed-source commercial use. However, potential dependencies mentioned in the architecture document require attention:

- **Grafana (AGPLv3):** This license is generally incompatible with closed-source commercial distribution or SaaS offerings due to its strong copyleft (viral) nature. Internal use might be acceptable, but careful legal review is needed. Using the MIT-licensed alternative **Chronograf** is recommended if Grafana's features are not strictly required or if AGPL compliance is too burdensome.
- **Coqui TTS (MPL 2.0):** The Mozilla Public License 2.0 is a weak copyleft license. While less restrictive than GPL/AGPL, it requires modifications to MPL-covered files to be made available under MPL. This can be problematic for proprietary modifications. Finding an alternative with a permissive license like **Piper TTS (MIT)** is strongly recommended for the Voice Processing Service to maintain full compatibility with closed-source commercial goals.

### Permissive Licenses (MIT, BSD, Apache 2.0)
These licenses (used by the majority of dependencies) are highly permissive and compatible with closed-source commercial use. They generally allow:
- Commercial use
- Modification
- Distribution
- Private use
- Sublicensing (MIT)

Requirements typically include preserving copyright notices and license text.
