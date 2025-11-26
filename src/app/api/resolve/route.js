import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();

    // 1. Input Validation
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
      return NextResponse.json({ error: "Invalid URL. Please enter a valid X or Twitter link." }, { status: 400 });
    }

    // 2. Fetch from Public API (FxTwitter/FixupX)
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

    // 3. Check Media Availability
    if (!tweet.media) {
       return NextResponse.json({ error: "No media found in this tweet." }, { status: 400 });
    }

    let mediaList = [];

    // Handle Videos (Prioritize High Quality)
    if (tweet.media.videos && tweet.media.videos.length > 0) {
        mediaList = tweet.media.videos.map(video => ({
            type: 'video',
            // FxTwitter usually returns the best quality in 'url', 
            // but if there are variants, we could sort them here.
            // For now, FxTwitter's 'url' is reliable for best playback.
            url: video.url, 
            thumbnail: video.thumbnail_url,
            // Generate a clean filename for the frontend to use
            filename: `DoReMi_Video_${tweet.author.screen_name}_${id}.mp4`
        }));
    } 
    // Handle Photos
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