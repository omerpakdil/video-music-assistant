import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: CustomAlertButton[];
  onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}: CustomAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={50} color="#10B981" />;
      case 'error':
        return <Ionicons name="close-circle" size={50} color="#EF4444" />;
      case 'warning':
        return <Ionicons name="warning" size={50} color="#F59E0B" />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={50} color="#3B82F6" />;
    }
  };

  const handleButtonPress = (button: CustomAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurView}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onDismiss}
          />
        </BlurView>

        <View style={styles.alertContainer}>
          <LinearGradient
            colors={['rgba(74, 91, 58, 0.95)', 'rgba(42, 26, 62, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.alertContent}
          >
            <View style={styles.iconContainer}>{getIcon()}</View>

            <Text style={styles.title}>{title}</Text>

            {message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => {
                const isLastButton = index === buttons.length - 1;
                const isCancelButton = button.style === 'cancel';
                const isDestructiveButton = button.style === 'destructive';

                if (isCancelButton) {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        styles.cancelButton,
                        !isLastButton && styles.buttonMargin,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <Text style={styles.cancelButtonText}>{button.text}</Text>
                    </TouchableOpacity>
                  );
                }

                if (isDestructiveButton) {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        !isLastButton && styles.buttonMargin,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>{button.text}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      !isLastButton && styles.buttonMargin,
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <LinearGradient
                      colors={['#A855F7', '#8B5CF6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>{button.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    width: '100%',
  },
  buttonMargin: {
    marginBottom: 10,
  },
  buttonGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
});
