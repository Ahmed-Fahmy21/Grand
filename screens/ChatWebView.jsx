
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native';

const ChatWebView = () => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src="https://tesdt-wrhu.vercel.app/"
          width="100%"
          height="100%"
          style={{ borderWidth: 0 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://tesdt-wrhu.vercel.app/' }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default ChatWebView;
