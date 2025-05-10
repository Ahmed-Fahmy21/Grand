// constants/styles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  roomItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  roomPrice: {
    fontSize: 16,
    color: "#3498db",
    marginVertical: 5,
  },
  roomDescription: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: 20,
  },
  sidebarContainer: {
    width: 250,
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    marginRight: 15,
    color: '#E64A19',
  },
  menuText: {
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
});
