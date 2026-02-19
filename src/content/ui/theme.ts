import { uiTokens } from './tokens'
import { hexToRgba } from '../utils'

export function buildTagStyle(tagColor: string, isActive: boolean, isDark: boolean) {
  if (isActive) {
    return {
      backgroundColor: hexToRgba(tagColor, uiTokens.tag.activeBgAlpha),
      borderColor: hexToRgba(tagColor, uiTokens.tag.activeBorderAlpha),
      color: isDark ? '#e2e8f0' : '#0f172a',
      boxShadow: `0 0 12px ${hexToRgba(tagColor, uiTokens.tag.activeGlowAlpha)}`,
      backdropFilter: uiTokens.blur.tag
    }
  }

  return {
    backgroundColor: isDark
      ? `rgba(226, 232, 240, ${uiTokens.tag.inactiveDarkBgAlpha})`
      : `rgba(15, 23, 42, ${uiTokens.tag.inactiveLightBgAlpha})`,
    borderColor: isDark
      ? `rgba(226, 232, 240, ${uiTokens.tag.inactiveDarkBorderAlpha})`
      : `rgba(15, 23, 42, ${uiTokens.tag.inactiveLightBorderAlpha})`,
    color: isDark
      ? `rgba(226, 232, 240, ${uiTokens.tag.inactiveDarkTextAlpha})`
      : `rgba(15, 23, 42, ${uiTokens.tag.inactiveLightTextAlpha})`,
    backdropFilter: uiTokens.blur.tag
  }
}
