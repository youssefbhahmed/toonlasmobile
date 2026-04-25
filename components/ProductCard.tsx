import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { formatPrice, discountPercent } from '../lib/utils';

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  compare_at_price: number | string | null;
  brand: string | null;
  rating_avg: number;
  rating_count: number;
  stock_quantity: number;
  image?: string | null;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const router = useRouter();
  const discount = discountPercent(
    Number(product.price),
    product.compare_at_price ? Number(product.compare_at_price) : null,
  );
  const img =
    product.image ||
    'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/thumbnail.webp';

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.slug}` as any)}
      style={{
        flex: 1,
        overflow: 'hidden',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
      }}
    >
      <View style={{ aspectRatio: 1, backgroundColor: '#FFFFFF', padding: 8 }}>
        <Image source={{ uri: img }} contentFit="contain" style={{ flex: 1 }} />
        {discount !== null && (
          <View
            style={{
              position: 'absolute',
              left: 6,
              top: 6,
              backgroundColor: '#E74C3C',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 3,
            }}
          >
            <Text style={{ color: 'white', fontSize: 9, fontWeight: '800' }}>
              −{discount}%
            </Text>
          </View>
        )}
        {product.stock_quantity === 0 && (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.85)',
            }}
          >
            <View style={{ backgroundColor: '#171717', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>Rupture</Text>
            </View>
          </View>
        )}
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        {/* Price */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#F47B20' }}>
            {formatPrice(product.price)}
          </Text>
          {product.compare_at_price &&
            Number(product.compare_at_price) > Number(product.price) && (
              <Text style={{ fontSize: 10, color: '#A3A3A3', textDecorationLine: 'line-through' }}>
                {formatPrice(product.compare_at_price)}
              </Text>
            )}
        </View>

        {/* Name */}
        <Text style={{ fontSize: 12, color: '#404040', lineHeight: 16, minHeight: 32 }} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Brand */}
        {product.brand && (
          <Text style={{ fontSize: 10, color: '#737373' }}>
            Vendu par : <Text style={{ color: '#404040', fontWeight: '600' }}>{product.brand}</Text>
          </Text>
        )}

        {/* Rating stars */}
        {Number(product.rating_avg) > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <View style={{ flexDirection: 'row' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={10}
                  color={i <= Math.round(Number(product.rating_avg)) ? '#F47B20' : '#E5E5E5'}
                  fill={i <= Math.round(Number(product.rating_avg)) ? '#F47B20' : '#E5E5E5'}
                />
              ))}
            </View>
            <Text style={{ fontSize: 10, color: '#737373' }}>({product.rating_count})</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
