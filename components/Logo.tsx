import { View, Text } from 'react-native';

export function Logo({
  size = 'md',
  color = 'light',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'light' | 'dark';
}) {
  const textSize = size === 'sm' ? 18 : size === 'lg' ? 30 : 22;
  const textColor = color === 'light' ? '#FFFFFF' : '#1E3A5F';
  const accentColor = color === 'light' ? '#1E3A5F' : '#F47B20';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text
        style={{
          fontSize: textSize * 0.6,
          fontWeight: '600',
          color: textColor,
          opacity: 0.85,
          letterSpacing: 0.5,
          marginRight: 4,
        }}
      >
        THE
      </Text>
      <Text
        style={{
          fontSize: textSize,
          fontWeight: '900',
          letterSpacing: -0.6,
          color: textColor,
        }}
      >
        Deal
      </Text>
      <Text
        style={{
          fontSize: textSize,
          fontWeight: '900',
          color: accentColor,
        }}
      >
        .
      </Text>
    </View>
  );
}
