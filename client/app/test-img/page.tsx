import AppImage from '@/components/ui/AppImage';

export default function TestPage() {
  return (
    <div>
      <AppImage src="https://grainzz-media-prod.s3.ap-south-1.amazonaws.com/test.jpg" width={500} height={500} alt="test" />
    </div>
  );
}
