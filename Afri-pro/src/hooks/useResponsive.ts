import { useWindowDimensions } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveValues {
  deviceType: DeviceType;
  isTablet: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  columns: number;
  padding: number;
  gap: number;
  cardWidth?: number;
}

export const useResponsive = (): ResponsiveValues => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  let deviceType: DeviceType = 'mobile';
  let columns = 1;
  let padding = 16;
  let gap = 12;

  // Tablet: 768px - 1024px
  // Desktop: > 1024px
  if (width >= 1024) {
    deviceType = 'desktop';
    columns = 4;
    padding = 24;
    gap = 16;
  } else if (width >= 768) {
    deviceType = 'tablet';
    columns = isLandscape ? 3 : 2;
    padding = 20;
    gap = 14;
  } else {
    deviceType = 'mobile';
    columns = 1;
    padding = 16;
    gap = 12;
  }

  return {
    deviceType,
    isTablet: deviceType === 'tablet',
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    width,
    height,
    isLandscape,
    isPortrait: !isLandscape,
    columns,
    padding,
    gap,
  };
};
