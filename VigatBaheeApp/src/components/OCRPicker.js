import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/theme';

const OCRPicker = ({ onTextExtracted }) => {
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelectImage = (useCamera) => {
        const options = { mediaType: 'photo', quality: 0.8 };
        const callback = (res) => {
            if (res.didCancel) return;
            if (res.errorMessage) {
                Alert.alert('Error', res.errorMessage);
                return;
            }
            if (res.assets && res.assets.length > 0) {
                setImageUri(res.assets[0].uri);
            }
        };

        if (useCamera) {
            launchCamera(options, callback);
        } else {
            launchImageLibrary(options, callback);
        }
    };

    const handleExtract = () => {
        if (!imageUri) return;
        setLoading(true);
        // Mock OCR extraction delay
        setTimeout(() => {
            setLoading(false);
            Alert.alert('OCR (Demo)', 'यह एक डेमो है। बाद में यहाँ से असली टेक्स्ट निकाला जाएगा।');
            onTextExtracted({
                name: 'रामकुमार',
                villageName: 'जयपुर',
                amount: '1100'
            });
            setImageUri(null); // Reset after extraction
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📷 स्मार्ट स्कैन (OCR)</Text>

            {!imageUri ? (
                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.btn} onPress={() => handleSelectImage(true)}>
                        <Text style={styles.btnText}>कैमरा</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn} onPress={() => handleSelectImage(false)}>
                        <Text style={styles.btnText}>गैलरी</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.previewBox}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setImageUri(null)}>
                            <Text style={styles.cancelText}>रद्द करें</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.extractBtn, loading && { opacity: 0.7 }]} onPress={handleExtract} disabled={loading}>
                            {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.extractText}>टेक्स्ट निकालें</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F3F4F6',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed'
    },
    title: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
    btnRow: { flexDirection: 'row', gap: SPACING.sm },
    btn: { flex: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 8, alignItems: 'center', borderRadius: BORDER_RADIUS.md },
    btnText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
    previewBox: { alignItems: 'center', gap: SPACING.xs },
    image: { width: '100%', height: 120, borderRadius: BORDER_RADIUS.sm, resizeMode: 'cover' },
    actionRow: { flexDirection: 'row', gap: SPACING.sm, width: '100%', marginTop: SPACING.xs },
    cancelBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#E5E7EB', borderRadius: BORDER_RADIUS.md },
    cancelText: { color: COLORS.text, fontWeight: '600' },
    extractBtn: { flex: 2, paddingVertical: 8, alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: BORDER_RADIUS.md },
    extractText: { color: COLORS.white, fontWeight: '700' }
});

export default OCRPicker;
