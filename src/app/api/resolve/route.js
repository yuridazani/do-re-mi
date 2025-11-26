import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
      return NextResponse.json({ error: "Invalid URL. Please enter a valid X or Twitter link." }, { status: 400 });
    }

    const cleanUrl = url.split('?')[0];
    const id = cleanUrl.split('/').pop();
    const apiUrl = `https://api.fxtwitter.com/i/status/${id}`;

    console.log(`🎵 Do Re Mi: Fetching melody from... ${apiUrl}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Tweet not found or private." }, { status: 404 });
    }

    const data = await response.json();
    const tweet = data.tweet;

    if (!tweet.media) {
       return NextResponse.json({ error: "No media found in this tweet." }, { status: 400 });
    }

    let mediaList = [];

    if (tweet.media.videos && tweet.media.videos.length > 0) {
        mediaList = tweet.media.videos.map(video => {

            let bestUrl = video.url;
            
            if (video.variants && Array.isArray(video.variants)) {
                const sortedVariants = video.variants
                    .filter(v => v.content_type === 'video/mp4') 
                    .filter(v => v.bitrate && v.bitrate < 5000000) 
                    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                
                if (sortedVariants.length > 0) {
                    bestUrl = sortedVariants[0].url;
                }
            }
            
            return {
                type: 'video',
                url: bestUrl,
                thumbnail: video.thumbnail_url,
                filename: `DoReMi_Video_${tweet.author.screen_name}_${id}.mp4`,
                // Tambah info untuk debugging
                codec: 'H.264', // Assume compatible codec
                container: 'MP4'
            };
        });
    } 
    else if (tweet.media.photos && tweet.media.photos.length > 0) {
        mediaList = tweet.media.photos.map((photo, index) => ({
            type: 'photo',
            url: photo.url,
            filename: `DoReMi_Photo_${tweet.author.screen_name}_${id}_${index + 1}.jpg`
        }));
    } else {
        return NextResponse.json({ error: "No downloadable media found." }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true,
        data: mediaList,
        author: tweet.author.name,
        username: tweet.author.screen_name,
        text: tweet.text
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Failed to fetch media. Please try again." }, { status: 500 });
  }
}
