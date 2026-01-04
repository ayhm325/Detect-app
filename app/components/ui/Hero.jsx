import BackgroundWrapper from './BackgroundWrapper';
import HoloButton from './HoloButton';
import { getTranslations } from 'next-intl/server';

export default async function Hero() {
  const t = await getTranslations('holoDemo');

  return (
    <BackgroundWrapper intensity="mid">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight holo-sheen"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--color-secondary), var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-background/90">{t('hero.description')}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <HoloButton variant="primary">{t('hero.primaryCta')}</HoloButton>
          <HoloButton variant="outline">{t('hero.secondaryCta')}</HoloButton>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
