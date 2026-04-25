import { View, Text } from 'react-native';

export function Logo({
  size = 'md',
  color = 'light',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'light' | 'dark';
}) {
  const textSize = size === 'sm' ? 20 : size === 'lg' ? 34 : 26;
  const textColor = color === 'light' ? '#FFFFFF' : '#1E3A5F';
  const dotColor = color === 'light' ? '#1E3A5F' : '#F47B20';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text
        style={{
          fontSize: textSize,
          fontWeight: '900',
          letterSpacing: -0.5,
          color: textColor,
        }}
      >
        toon
      </Text>
      <Text
        style={{
          fontSize: textSize,
          fontWeight: '900',
          color: dotColor,
          marginLeft: 1,
        }}
      >
        .
      </Text>
    </View>
  );
}
