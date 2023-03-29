# A Beginner's Guide to EPCIS 2.0 and CBV

## Table of Contents
1. [Introduction](#introduction)
2. [What are EPCIS 2.0 and CBV?](#what-are-epcis-20-and-cbv)
3. [Why Use EPCIS and CBV?](#why-use-epcis-and-cbv)
4. [Components of EPCIS](#components-of-epcis)
5. [EPCIS Document Structure](#epcis-document-structure)
6. [Core Business Vocabulary (CBV) Overview](#core-business-vocabulary-cbv-overview)
7. [Elements of CBV](#elements-of-cbv)
8. [EPCIS 2.0 Improvements](#epcis-20-improvements)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Case Studies](#case-studies)
11. [Conclusion](#conclusion)

## 1. Introduction <a name="introduction"></a>

Supply chain visibility is of utmost importance to businesses around the world. In an era of interconnected systems, knowing who, what, when, where, why, and how products move through the supply chain is essential for ensuring efficiency and security. One standard that has emerged as the leading solution for sharing supply chain events is EPCIS, along with its companion standard, CBV. This guide provides an introduction to the updated version of these standards, known as EPCIS 2.0 and the CBV.

## 2. What are EPCIS 2.0 and CBV? <a name="what-are-epcis-20-and-cbv"></a>

The Electronic Product Code Information Services (EPCIS) is a standard framework for securely sharing data about products, assets, and events throughout the supply chain. The Core Business Vocabulary (CBV) complements EPCIS by defining standardized terms and data elements to ensure compatibility between different EPCIS implementations. 

EPCIS 2.0 is the latest version of the EPCIS standard, which introduces several improvements and enhancements to the previous version, EPCIS 1.2.

## 3. Why Use EPCIS and CBV? <a name="why-use-epcis-and-cbv"></a>

EPCIS and CBV provide a standardized approach to supply chain event data sharing, allowing companies to:

- Improve visibility and traceability of products and assets;
- Enhance collaboration with other businesses in the supply chain;
- Reduce the risk of counterfeit goods;
- Streamline processes and increase efficiency;
- Meet regulatory and industry requirements; and
- Enhance overall supply chain performance.

## 4. Components of EPCIS <a name="components-of-epcis"></a>

EPCIS consists of four main components:

1. **EPCIS Events**: Records of specific actions or occurrences related to products or assets, such as shipping, receiving, or transforming.
2. **EPCIS Repository**: A database for storing EPCIS events.
3. **EPCIS Capture Interface**: The application programming interface (API) used to submit EPCIS events to an EPCIS repository.
4. **EPCIS Query Interface**: The API for requesting EPCIS events from an EPCIS repository.

## 5. EPCIS Document Structure <a name="epcis-document-structure"></a>

An EPCIS document consists of a series of EPCIS events, such as ObjectEvents, which document the movement or transformation of products. Each event includes:

- **Event type**: The type of action being recorded (e.g., shipping, receiving, etc.).
- **Event time**: The time the event occurred.
- **EPC list**: A list of Electronic Product Codes (EPCs) associated with the event.
- **Business step**: The specific action the event represents.
- **Disposition**: The status of the items after the event.
- **Read point**: The location where the event was observed.
- **Business location**: The broader location within the organization where the event took place.
- **Source and destination**: Information about the party sending and receiving the items.
- **Business transaction list**: References to related business transactions, such as a purchase order.

## 6. Core Business Vocabulary (CBV) Overview <a name="core-business-vocabulary-cbv-overview"></a>

The CBV is a companion standard to EPCIS that defines standardized business terms and data elements to ensure compatibility between EPCIS implementations. It includes:

1. **Standardized identifiers**, such as Global Trade Item Numbers (GTINs), Serialized Global Trade Item Numbers (SGTINs), Global Location Numbers (GLNs), and Serialized Shipping Container Codes (SSCCs).