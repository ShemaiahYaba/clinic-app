import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast, { BaseToastProps } from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface CustomToastProps extends BaseToastProps {
  type: ToastType;
}

const getIconName = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'alert-circle';
    case 'warning':
      return 'warning';
    case 'info':
      return 'information-circle';
    default:
      return 'information-circle';
  }
};

const getIconColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#22c55e';
    case 'error':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    case 'info':
      return '#3b82f6';
    default:
      return '#3b82f6';
  }
};

const getBackgroundColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#dcfce7';
    case 'error':
      return '#fee2e2';
    case 'warning':
      return '#fef3c7';
    case 'info':
      return '#dbeafe';
    default:
      return '#dbeafe';
  }
};

const getTextColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#166534';
    case 'error':
      return '#991b1b';
    case 'warning':
      return '#92400e';
    case 'info':
      return '#1e40af';
    default:
      return '#1e40af';
  }
};

export const CustomToast = ({ type, text1, text2, ...props }: CustomToastProps) => {
  const iconName = getIconName(type);
  const iconColor = getIconColor(type);
  const backgroundColor = getBackgroundColor(type);
  const textColor = getTextColor(type);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Ionicons name={iconName as any} size={24} color={iconColor} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>{text1}</Text>
        {text2 && <Text style={[styles.message, { color: textColor }]}>{text2}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
  },
});

export const toastConfig = {
  success: (props: BaseToastProps) => <CustomToast {...props} type="success" />,
  error: (props: BaseToastProps) => <CustomToast {...props} type="error" />,
  warning: (props: BaseToastProps) => <CustomToast {...props} type="warning" />,
  info: (props: BaseToastProps) => <CustomToast {...props} type="info" />,
}; 