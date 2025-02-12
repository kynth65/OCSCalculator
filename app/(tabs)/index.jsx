import { useState, useEffect, useRef } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  Linking,
  TextInput,
} from "react-native";

const OCSDisplay = ({ visible, data, onClose }) => {
  const [showButtons, setShowButtons] = useState(true);

  const createAndSharePDF = async () => {
    // Hide buttons
    setShowButtons(false);

    // Wait for the state update to be reflected in the UI
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Official Computation Sheet</title>
            <style>
              @page {
                margin: 20px;
              }
              body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.4;
                padding: 20px;
              }
              .company-name {
                color: #666;
                text-align: center;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .client-details {
                margin: 20px 0;
              }
              .client-details div {
                margin: 5px 0;
              }
              .label {
                color: #008000;
                font-weight: bold;
                display: inline-block;
                width: 140px;
              }
              .main-title {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin: 30px 0;
                text-transform: uppercase;
              }
              .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
              }
              .grid-item {
                margin-bottom: 10px;
              }
              .total-section {
                text-align: center;
                margin: 30px 0;
                color: #666;
                text-transform: uppercase;
              }
              .total-amount {
                font-size: 22px;
                font-weight: bold;
                margin-top: 10px;
              }
              .breakdown {
                margin-top: 30px;
              }
              .breakdown-title {
                text-align: center;
                font-size: 18px;
                color: #666;
                margin-bottom: 20px;
                text-transform: uppercase;
              }
              .spotcash {
                color: #008000;
                font-weight: bold;
                font-size: 18px;
                margin: 10px 0;
              }
              .payment-note {
                color: #FF0000;
                font-style: italic;
                margin: 10px 0;
              }
              .payment-schedule {
                margin-top: 20px;
                text-align: right;
              }
            </style>
          </head>
          <body>
            <!-- Rest of your HTML content remains the same -->
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Platform specific sharing logic
      if (Platform.OS === "android") {
        const pdfName = `OCS_${data.clientName}_${data.blockLot}.pdf`;
        const downloadDir = `${FileSystem.documentDirectory}Download/`;
        const destinationUri = `${downloadDir}${pdfName}`;

        const dirInfo = await FileSystem.getInfoAsync(downloadDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(downloadDir, {
            intermediates: true,
          });
        }

        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(destinationUri, {
            mimeType: "application/pdf",
            dialogTitle: "Share OCS PDF",
          });
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Share OCS PDF",
          });
        }
      }

      Alert.alert("Success", "PDF has been created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Show buttons again after successful PDF generation
            setShowButtons(true);
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating PDF:", error);
      Alert.alert(
        "Error",
        "Failed to create PDF: " + (error.message || "Unknown error"),
        [
          {
            text: "OK",
            onPress: () => {
              // Show buttons again if there was an error
              setShowButtons(true);
            },
          },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={ocsStyles.ocsWrapper}>
        <ScrollView style={ocsStyles.ocsContainer}>
          {/* Header Section */}
          <View style={ocsStyles.headerSection}>
            <Text style={ocsStyles.companyName}>Evergreen Realty PH</Text>
            <View style={ocsStyles.clientInfoBox}>
              <View style={ocsStyles.infoRow}>
                <Text style={ocsStyles.infoLabel}>Client Name:</Text>
                <Text style={ocsStyles.infoValue}>{data.clientName}</Text>
              </View>
              <View style={ocsStyles.infoRow}>
                <Text style={ocsStyles.infoLabel}>Project:</Text>
                <Text style={ocsStyles.infoValue}>{data.project}</Text>
              </View>
              <View style={ocsStyles.infoRow}>
                <Text style={ocsStyles.infoLabel}>Number:</Text>
                <Text style={ocsStyles.infoValue}>{data.phoneNumber}</Text>
              </View>
            </View>
          </View>

          <View style={ocsStyles.divider} />

          {/* Main Title */}
          <Text style={ocsStyles.mainTitle}>OFFICIAL COMPUTATION SHEET</Text>

          {/* Details Grid */}
          <View style={ocsStyles.detailsGrid}>
            <View style={ocsStyles.gridRow}>
              <View style={ocsStyles.gridItem}>
                <Text style={ocsStyles.gridLabel}>Reservation Date:</Text>
                <Text style={ocsStyles.gridValue}>{data.reservationDate}</Text>
              </View>
              <View style={ocsStyles.gridItem}>
                <Text style={ocsStyles.gridLabel}>Block and Lot Number:</Text>
                <Text style={ocsStyles.gridValue}>{data.blockLot}</Text>
              </View>
            </View>
            <View style={ocsStyles.gridRow}>
              <View style={ocsStyles.gridItem}>
                <Text style={ocsStyles.gridLabel}>Terms:</Text>
                <Text style={ocsStyles.gridValue}>{data.terms}</Text>
              </View>
              <View style={ocsStyles.gridItem}>
                <Text style={ocsStyles.gridLabel}>Price per sq.m.:</Text>
                <Text style={ocsStyles.gridValue}>
                  ₱
                  {parseFloat(data.pricePerSqm).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
            <View style={ocsStyles.gridRow}>
              <View style={ocsStyles.gridItem}>
                <Text style={ocsStyles.gridLabel}>Type:</Text>
                <Text style={ocsStyles.gridValue}>Agricultural</Text>
              </View>
              <View style={ocsStyles.gridItem}>
                <Text style={ocsStyles.gridLabel}>Lot Area in sq.m.:</Text>
                <Text style={ocsStyles.gridValue}>{data.lotArea}</Text>
              </View>
            </View>
          </View>

          <View style={ocsStyles.divider} />

          {/* Total Price Section */}
          <View style={ocsStyles.totalPriceSection}>
            <Text style={ocsStyles.totalLabel}>TOTAL CONTRACT PRICE</Text>
            <Text style={ocsStyles.totalAmount}>
              ₱{data.totalPrice.toLocaleString()}
            </Text>
          </View>

          <View style={ocsStyles.divider} />

          {/* Payment Breakdown */}
          <View style={ocsStyles.breakdownSection}>
            <Text style={ocsStyles.breakdownTitle}>BREAKDOWN OF PAYMENT</Text>
            <View style={ocsStyles.spotcashSection}>
              <Text style={ocsStyles.spotcashLabel}>SPOTCASH</Text>
              <Text style={ocsStyles.spotcashAmount}>
                ₱{data.totalPrice.toLocaleString()}
              </Text>
              <Text style={ocsStyles.paymentNote}>
                Shall be payable within a month, reservation fee
              </Text>
              <Text style={ocsStyles.paymentNote}>
                ₱ 20,000.00 is deductible.
              </Text>
              <View style={ocsStyles.paymentSchedule}>
                <Text style={ocsStyles.scheduleDate}>
                  {data.paymentMonth} {data.paymentYear}
                </Text>
                <Text style={ocsStyles.scheduleAmount}>
                  ₱{data.totalPrice.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          {showButtons && (
            <View style={ocsStyles.buttonContainer}>
              <TouchableOpacity
                style={ocsStyles.generateButton}
                onPress={createAndSharePDF}
              >
                <Text style={ocsStyles.buttonText}>Generate PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ocsStyles.closeButton} onPress={onClose}>
                <Text style={ocsStyles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const app = () => {
  // State management for form inputs
  const [clientName, setClientName] = useState("");
  const [project, setProject] = useState("BEESCAPES");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [terms, setTerms] = useState("SPOTCASH");
  const [blockLot, setBlockLot] = useState("");
  const [pricePerSqm, setPricePerSqm] = useState("");
  const [lotArea, setLotArea] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMonth, setPaymentMonth] = useState("");
  const [paymentYear, setPaymentYear] = useState("");
  const [showOCS, setShowOCS] = useState(false);

  // Calculate total price in real time
  useEffect(() => {
    if (pricePerSqm && lotArea) {
      const calculated = parseFloat(pricePerSqm) * parseFloat(lotArea);
      setTotalPrice(calculated);
    }
  }, [pricePerSqm, lotArea]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OCS Calculator</Text>

      {/* Client Details Section */}
      <Text style={styles.sectionTitle}>CLIENT DETAILS</Text>

      <Text style={styles.label}>Client Name</Text>
      <TextInput
        style={styles.input}
        value={clientName}
        onChangeText={setClientName}
        placeholder="Enter client name"
        placeholderTextColor="#FFB6A5"
      />

      <Text style={styles.label}>Project</Text>
      <TextInput
        style={styles.input}
        value={project}
        onChangeText={setProject}
        placeholder="BEESCAPES"
        placeholderTextColor="#FFB6A5"
      />

      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter contact number"
        placeholderTextColor="#FFB6A5"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Reservation Date</Text>
      <TextInput
        style={styles.input}
        value={reservationDate}
        onChangeText={setReservationDate}
        placeholder="MM/DD/YYYY"
        placeholderTextColor="#FFB6A5"
      />

      <Text style={styles.label}>Block and Lot Number</Text>
      <TextInput
        style={styles.input}
        value={blockLot}
        onChangeText={setBlockLot}
        placeholder="Enter Block and Lot"
        placeholderTextColor="#FFB6A5"
      />

      {/* Price Details Section */}
      <Text style={styles.sectionTitle}>PRICE DETAILS</Text>

      <Text style={styles.label}>Price per sq.m.</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.pesoSign}>₱</Text>
        <TextInput
          style={styles.priceInput}
          value={pricePerSqm}
          onChangeText={setPricePerSqm}
          placeholder="0.00"
          placeholderTextColor="#FFB6A5"
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Lot Area in sq.m.</Text>
      <TextInput
        style={styles.input}
        value={lotArea}
        onChangeText={setLotArea}
        placeholder="Enter lot area"
        placeholderTextColor="#FFB6A5"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Total Price</Text>
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceText}>
          ₱{" "}
          {totalPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Payment Breakdown Section */}
      <Text style={styles.sectionTitle}>BREAKDOWN OF PAYMENT</Text>
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownText}>SPOTCASH (TOTAL)</Text>
        <Text style={styles.breakdownAmount}>
          ₱ {totalPrice.toLocaleString()}
        </Text>
        <Text style={styles.breakdownNote}>
          Shall be payable within a month.{"\n"}
          Reservation fee ₱20,000.00 is deductible.
        </Text>
        <Text style={styles.label}>Date of Payment</Text>
        <View style={styles.dateContainer}>
          <View style={styles.dateInputGroup}>
            <Text style={styles.sublabel}>Month</Text>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={paymentMonth}
              onChangeText={setPaymentMonth}
              placeholder="Month"
              placeholderTextColor="#FFB6A5"
            />
          </View>
          <View style={styles.dateInputGroup}>
            <Text style={styles.sublabel}>Year</Text>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={paymentYear}
              onChangeText={setPaymentYear}
              placeholder="YYYY"
              placeholderTextColor="#FFB6A5"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setShowOCS(true)}>
        <Text style={styles.buttonText}>Generate OCS</Text>
      </TouchableOpacity>

      <OCSDisplay
        visible={showOCS}
        data={{
          clientName,
          project,
          phoneNumber,
          reservationDate,
          terms,
          blockLot,
          pricePerSqm,
          lotArea,
          totalPrice,
          paymentMonth,
          paymentYear,
        }}
        onClose={() => setShowOCS(false)}
      />

      {/* Add padding at bottom for scrolling */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

export default app;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    width: "100%",
    maxWidth: 500, // Add max width for better mobile display
    alignSelf: "center", // Center the container
  },
  title: {
    color: "black",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#2E7D32",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
  },
  label: {
    color: "#2E7D32",
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    width: "100%", // Ensure full width
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 20,
    width: "100%", // Ensure full width
  },
  pesoSign: {
    fontSize: 16,
    paddingLeft: 12,
    color: "#FFB6A5",
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  totalPriceContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: "100%", // Ensure full width
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFB6A5",
  },
  breakdownContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: "100%", // Ensure full width
  },
  breakdownText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  breakdownAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFB6A5",
    marginBottom: 10,
  },
  breakdownNote: {
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
    width: "100%", // Ensure full width
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInput: {
    marginBottom: 0,
    borderWidth: 1, // Add border
    borderColor: "#ddd", // Light gray border
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sublabel: {
    color: "#2E7D32",
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 12,
  },
  button: {
    backgroundColor: "#FFB6A5",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginVertical: 20,
    width: "100%", // Ensure full width
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 50,
  },

  closeButton: {
    backgroundColor: "#FFB6A5",
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInput: {
    marginBottom: 0,
  },
  sublabel: {
    color: "#2E7D32",
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 12,
  },
  ocsPaymentDate: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "500",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#FFB6A5",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
  },
});

const ocsStyles = StyleSheet.create({
  ocsWrapper: {
    flex: 1,
    padding: 16, // Increased from 13
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  ocsContainer: {
    width: "100%",
    maxWidth: 750, // Increased from 625
    alignSelf: "center",
  },
  headerSection: {
    borderWidth: 1,
    padding: 12, // Increased from 10
  },
  companyName: {
    fontSize: 28, // Increased from 23
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 7, // Increased from 6
    textDecorationColor: "green",
  },
  clientInfoBox: {
    padding: 12, // Increased from 10
    margin: 7, // Increased from 6
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4, // Increased from 3
  },
  infoLabel: {
    width: 120, // Increased from 100
    fontSize: 18, // Increased from 15
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 18, // Increased from 15
  },
  mainTitle: {
    fontSize: 24, // Increased from 20
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16, // Increased from 13
  },
  detailsGrid: {
    padding: 12, // Increased from 10
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 7, // Increased from 6
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 5, // Increased from 4
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 7, // Increased from 6
  },
  gridLabel: {
    fontSize: 18, // Increased from 15
    fontWeight: "500",
  },
  gridValue: {
    fontSize: 18, // Increased from 15
  },
  totalPriceSection: {
    borderWidth: 1,
    padding: 12, // Increased from 10
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 22, // Increased from 18
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 22, // Increased from 18
    fontWeight: "bold",
  },
  breakdownSection: {
    marginTop: 0,
  },
  breakdownTitle: {
    fontSize: 22, // Increased from 18
    fontWeight: "bold",
    textAlign: "center",
    padding: 12, // Increased from 10
    borderWidth: 1,
  },
  spotcashSection: {
    padding: 12, // Increased from 10
    borderWidth: 1,
    borderTopWidth: 0,
  },
  spotcashLabel: {
    fontSize: 22, // Increased from 18
    fontWeight: "bold",
  },
  spotcashAmount: {
    fontSize: 22, // Increased from 18
    fontWeight: "bold",
    textAlign: "right",
    borderBottomWidth: 1,
    paddingBottom: 7, // Increased from 6
    marginBottom: 7, // Increased from 6
  },
  paymentNote: {
    fontStyle: "italic",
    fontSize: 17, // Increased from 14
  },
  paymentSchedule: {
    marginTop: 12, // Increased from 10
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7, // Increased from 6
    borderTopWidth: 1,
  },
  scheduleDate: {
    fontSize: 18, // Increased from 15
  },
  scheduleAmount: {
    fontSize: 18, // Increased from 15
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 23, // Increased from 19
    gap: 12, // Increased from 10
  },
  generateButton: {
    flex: 1,
    borderWidth: 1,
    padding: 16, // Increased from 13
    borderRadius: 6, // Increased from 5
    alignItems: "center",
  },
  closeButton: {
    flex: 1,
    borderWidth: 1,
    padding: 16, // Increased from 13
    borderRadius: 6, // Increased from 5
    alignItems: "center",
  },
  buttonText: {
    fontSize: 22, // Increased from 18
    fontWeight: "bold",
  },
});
