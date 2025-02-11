import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import ViewShot from "react-native-view-shot";
import { Platform } from "react-native";

const OCSDisplay = ({ visible, data, onClose }) => {
  const viewShotRef = useRef();
  const [hasPermission, setHasPermission] = useState(false);

  // Request permission when component mounts
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === "granted");
      }
    })();
  }, []);

  const saveOCS = async () => {
    try {
      // Check current permission status
      const { status } = await MediaLibrary.getPermissionsAsync();

      if (status !== "granted") {
        // Try requesting permission
        const { status: newStatus } =
          await MediaLibrary.requestPermissionsAsync();

        if (newStatus !== "granted") {
          // If permission is denied, show alert with option to open settings
          Alert.alert(
            "Permission Required",
            "Storage permission is required to save OCS documents. Please enable it in settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openSettings();
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
          return;
        }
      }

      // If we have permission, proceed with saving
      const uri = await viewShotRef.current.capture();
      const asset = await MediaLibrary.createAssetAsync(uri);
      alert("OCS has been saved to your gallery!");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("Error saving OCS:", error);
      alert("Failed to save OCS. Please try again.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
        <ScrollView style={styles.ocsContainer}>
          <View style={styles.ocsHeader}>
            <Text style={styles.ocsTitle}>Evergreen Realty PH</Text>
            <View style={styles.ocsClientInfo}>
              <View style={styles.ocsInfoRow}>
                <Text style={styles.ocsInfoLabel}>Client Name:</Text>
                <Text style={styles.ocsInfoValue}>{data.clientName}</Text>
              </View>
              <View style={styles.ocsInfoRow}>
                <Text style={styles.ocsInfoLabel}>Project:</Text>
                <Text style={styles.ocsInfoValue}>{data.project}</Text>
              </View>
              <View style={styles.ocsInfoRow}>
                <Text style={styles.ocsInfoLabel}>Number:</Text>
                <Text style={styles.ocsInfoValue}>{data.phoneNumber}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.ocsMainTitle}>OFFICIAL COMPUTATION SHEET</Text>

          <View style={styles.ocsDetailsGrid}>
            <View style={styles.ocsGridRow}>
              <View style={styles.ocsGridItem}>
                <Text style={styles.ocsLabel}>Reservation Date:</Text>
                <Text style={styles.ocsValue}>{data.reservationDate}</Text>
              </View>
              <View style={styles.ocsGridItem}>
                <Text style={styles.ocsLabel}>Block and Lot Number:</Text>
                <Text style={styles.ocsValue}>{data.blockLot}</Text>
              </View>
            </View>
            <View style={styles.ocsGridRow}>
              <View style={styles.ocsGridItem}>
                <Text style={styles.ocsLabel}>Terms:</Text>
                <Text style={styles.ocsValue}>{data.terms}</Text>
              </View>
              <View style={styles.ocsGridItem}>
                <Text style={styles.ocsLabel}>Price per sq.m.:</Text>
                <Text style={styles.ocsValue}>
                  ₱
                  {parseFloat(data.pricePerSqm).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.ocsGridRow}>
              <View style={styles.ocsGridItem}>
                <Text style={styles.ocsLabel}>Type:</Text>
                <Text style={styles.ocsValue}>Agricultural</Text>
              </View>
              <View style={styles.ocsGridItem}>
                <Text style={styles.ocsLabel}>Lot Area in sq.m.:</Text>
                <Text style={styles.ocsValue}>{data.lotArea}</Text>
              </View>
            </View>
          </View>

          <View style={styles.ocsTotalPrice}>
            <Text style={styles.ocsTotalLabel}>TOTAL CONTRACT PRICE</Text>
            <Text style={styles.ocsTotalAmount}>
              ₱{data.totalPrice.toLocaleString()}
            </Text>
          </View>

          <View style={styles.ocsBreakdown}>
            <Text style={styles.ocsBreakdownTitle}>BREAKDOWN OF PAYMENT</Text>
            <View style={styles.ocsSpotcashContainer}>
              <Text style={styles.ocsSpotcashLabel}>SPOTCASH</Text>
              <Text style={styles.ocsSpotcashAmount}>
                ₱{data.totalPrice.toLocaleString()}
              </Text>
              <Text style={styles.ocsNote}>
                Shall be payable within a month, reservation fee
              </Text>
              <Text style={styles.ocsNote}>₱ 20,000.00 is deductible.</Text>
              <View style={styles.ocsPaymentSchedule}>
                <Text style={styles.ocsPaymentDate}>
                  {data.paymentMonth} {data.paymentYear}
                </Text>
                <Text style={styles.ocsPaymentAmount}>
                  ₱{data.totalPrice.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.downloadButton} onPress={saveOCS}>
              <Text style={styles.buttonText}>Save OCS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ViewShot>
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
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 20,
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
  button: {
    backgroundColor: "#FFB6A5",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 50,
  },

  ocsContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  ocsHeader: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  ocsTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  ocsClientInfo: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 4,
  },
  ocsInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ocsInfoLabel: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
    width: 100, // Fixed width for labels to align them
  },
  ocsInfoValue: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  ocsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  ocsMainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  ocsDetailsGrid: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
  },
  ocsGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ocsGridItem: {
    flex: 1,
    paddingHorizontal: 5,
  },
  ocsLabel: {
    color: "#2E7D32",
    fontSize: 14,
    marginBottom: 2,
  },
  ocsValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  ocsTotalPrice: {
    backgroundColor: "black",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  ocsTotalLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ocsTotalAmount: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ocsBreakdown: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
  },
  ocsBreakdownTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
  ocsSpotcashContainer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
  },
  ocsSpotcashLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  ocsSpotcashAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  ocsNote: {
    color: "#FF6B6B",
    fontSize: 14,
    fontStyle: "italic",
  },
  ocsPaymentSchedule: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
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
