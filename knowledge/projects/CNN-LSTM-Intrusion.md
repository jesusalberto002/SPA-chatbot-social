# Network Intrusion Detection in IoT-Enabled Healthcare (CNN-LSTM)

## Overview
This project, **“Network Intrusion Detection in IoT-Enabled Healthcare Devices Using Hybrid CNN-LSTM Models,”** focuses on securing **Internet of Medical Things (IoMT)** networks. It implements a deep learning architecture that combines **Convolutional Neural Networks (CNN)** and **Long Short-Term Memory (LSTM)** networks to detect sophisticated cyber threats.

The work aims to go beyond “black box” AI by applying **Explainable AI (XAI)**—specifically **SHAP (SHapley Additive exPlanations)**—so security analysts can understand *why* a connection is flagged as malicious.

## Problem Statement
The growth of IoT-enabled healthcare devices has expanded the attack surface, putting patient data and life-critical systems at risk. Traditional security approaches often struggle to:

- **Detect complex patterns:** Many systems cannot jointly model **spatial** packet characteristics and **temporal** traffic behavior.
- **Provide transparency:** High-accuracy deep models are often opaque, making incident response harder.
- **Handle diverse attacks in real time:** There is a need to identify threats such as **DDoS**, **spoofing**, and **reconnaissance** across IoMT-relevant protocols and stacks.

## Current Scope (Implemented)

### 1) Hybrid Deep Learning Architecture
- **CNN:** extracts spatial features and local patterns from network packet representations.
- **LSTM:** models temporal sequences and evolving traffic behavior over time.
- **Performance target:** accuracy in the **95–99%** range, aligned with strong intrusion-detection literature (dataset-dependent).

### 2) Explainable AI (XAI)
- **SHAP** used to interpret model outputs and feature contributions.
- **Feature importance** visualizations (e.g. summary plots) to show which features drive **malicious vs. benign** decisions.

### 3) Data Processing and Analysis
- **Jupyter notebook pipeline** (`IFN712_1.ipynb`, `IFN712_2.ipynb`, `IFN712_3.ipynb`) covering cleaning, feature engineering, training, and evaluation.
- **Attack classification** targeting IoT-relevant threats, including Bluetooth-based attacks, Wi-Fi exploits, and **MQTT**-related vulnerabilities.

### 4) Research and Validation
- **Literature review** grounding hybrid intrusion detection in IoMT / Industry 4.0 contexts.
- **Standard metrics:** accuracy, precision, recall, and F1-score for rigorous evaluation.

## Architecture Snapshot

### Modeling Layer
- **Convolutional layers:** spatial feature extraction.
- **LSTM layers:** temporal sequence modeling.
- **Dense / output layers:** multi-class traffic classification.

### Explainability Layer
- **SHAP** (kernel/tree explainer patterns as appropriate) for contribution analysis.
- **Matplotlib / Seaborn** for intrusion heatmaps and importance plots.

## Technical Highlights
- **IoMT-focused domain:** security framing aligned with healthcare IoT constraints.
- **Transparency-first:** “explainable security” for analyst trust and auditability.
- **Modular workflow:** research → implementation (notebooks) → visualization and reporting.

## Result
The CNN-LSTM intrusion detection project demonstrates strong competency in **deep learning** and **cybersecurity**. By pairing high-performance detection with **explainable** outputs, it targets a practical, trustworthy approach to protecting vulnerable IoT healthcare networks from modern threats.
