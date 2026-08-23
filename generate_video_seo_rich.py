import os
import json

tools_data = [
    {
        "id": "compress-video",
        "name": "Compress Video",
        "desc": "Need to send a bulky recording over email or post it on social media without hitting size limits? The compression tool reduces file sizes substantially by re-encoding the footage at a lower bitrate. It’s perfect when you have massive screen recordings or high-resolution camera footage that needs to be scaled down for the web.",
        "steps": [
            "Drag your oversized video onto the target area.",
            "Choose a compression level (low, medium, or high).",
            "Click 'Compress' to start the local FFmpeg WASM encoding.",
            "Download the smaller, web-friendly output."
        ],
        "faqs": [
            {"q": "Will compression ruin my video quality?", "a": "There is a slight trade-off between file size and quality, but the medium setting usually retains excellent visual fidelity while shrinking the file."},
            {"q": "Is there a limit to how large the input video can be?", "a": "Since everything runs locally in your browser memory, it depends on your device's available RAM. For best results, keep inputs under 2GB."}
        ],
        "tip": "If your file is still too large, consider changing the format to WebM alongside compressing it."
    },
    {
        "id": "convert-video",
        "name": "Convert Format",
        "desc": "Sometimes a platform demands a specific file extension. This utility allows you to switch between popular formats like MP4, WebM, and MOV natively in your browser. It utilizes the FFmpeg WASM library to restructure the media container and encode the underlying streams correctly.",
        "steps": [
            "Select the clip you need to convert.",
            "Pick the destination format from the dropdown menu.",
            "Initiate the conversion process.",
            "Save the newly formatted file to your drive."
        ],
        "faqs": [
            {"q": "Does converting format reduce quality?", "a": "Not necessarily. If you choose a high bitrate, the quality remains nearly identical to the original."},
            {"q": "Can I convert MOV to MP4 for Windows?", "a": "Yes, MP4 is highly compatible across all operating systems and is the recommended output format."}
        ],
        "tip": "WebM is fantastic for web usage due to its efficiency, but MP4 offers the broadest compatibility across devices."
    },
    {
        "id": "trim-video",
        "name": "Trim Video",
        "desc": "When you only want to showcase a specific highlight from a long presentation or gaming session, trimming is the way to go. By specifying start and end points, you slice out just the relevant segment. It processes incredibly fast because it only acts on the selected duration of your original file.",
        "steps": [
            "Upload the lengthy video into the trimmer.",
            "Use the slider to define the precise start and end timestamps.",
            "Hit the 'Trim' button to cut the video.",
            "Export the highlighted section as a new file."
        ],
        "faqs": [
            {"q": "Is trimming exact to the millisecond?", "a": "The tool trims as close as possible to the specified keyframes, usually within a fraction of a second."},
            {"q": "Does trimming re-encode the entire file?", "a": "No, it typically only re-encodes the segments near the cut points, making it much faster than a full render."}
        ],
        "tip": "Make sure your start point is slightly before the action begins so nothing gets cut off."
    },
    {
        "id": "video-to-mp3",
        "name": "Video to MP3",
        "desc": "Extracting the soundtrack from a lecture or a music clip is a breeze with this feature. It rips the audio track directly from the video file and exports it as a standalone MP3. This means you can listen to essential talks as podcasts without needing the visual element.",
        "steps": [
            "Import the video containing the desired audio.",
            "Verify the audio extraction settings.",
            "Click to separate the audio track.",
            "Download the resulting MP3 file."
        ],
        "faqs": [
            {"q": "What bitrate is the MP3 exported at?", "a": "The MP3 is typically exported at 192kbps or 320kbps depending on your selection, ensuring high quality."},
            {"q": "Can I extract audio from an MKV file?", "a": "If your browser supports reading the MKV container, the FFmpeg engine can extract the audio just fine."}
        ],
        "tip": "This is perfect for turning long YouTube video downloads into convenient audio podcasts for your commute."
    },
    {
        "id": "video-to-gif",
        "name": "Video to GIF",
        "desc": "If you want to create a looping animation for a blog post or chat message, converting a short video snippet into a GIF is highly effective. The browser-based engine handles the frame extraction and palette generation. The result is a lightweight, infinitely looping animated image.",
        "steps": [
            "Add the video clip you want to animate.",
            "Select the framerate and dimensions for the GIF.",
            "Generate the looping animation.",
            "Save the GIF image."
        ],
        "faqs": [
            {"q": "Why is the GIF file size larger than the video?", "a": "GIF is an older format without advanced compression. Reducing the framerate or resolution helps keep the size down."},
            {"q": "Can I choose which part of the video to make a GIF?", "a": "It's best to trim the video first using the Trim tool, then upload that trimmed clip here."}
        ],
        "tip": "Keep GIFs under 10 seconds and at a lower resolution (like 480p) for optimal web performance."
    },
    {
        "id": "mute-video",
        "name": "Mute Video",
        "desc": "Removing background noise, accidental chatter, or copyrighted music from your clip is essential before public sharing. The mute function strips the audio channel completely, leaving you with a silent visual track. It ensures your footage focuses solely on the visual action.",
        "steps": [
            "Load the noisy video into the workspace.",
            "Confirm you want to remove all audio streams.",
            "Process the file to strip the sound.",
            "Download the silenced video."
        ],
        "faqs": [
            {"q": "Does muting affect the video quality?", "a": "No, the video stream is simply copied over without the audio stream, so visual quality is perfectly preserved."},
            {"q": "Can I mute only a specific section?", "a": "This tool mutes the entire file. For partial muting, you'd need the advanced Video Editor."}
        ],
        "tip": "Muting a video is extremely fast because it doesn't require re-encoding the video frames."
    },
    {
        "id": "video-editor",
        "name": "Video Editor",
        "desc": "For more granular control, the visual editor lets you manipulate your file with a timeline interface. You can set precise in and out markers before committing to an export. It gives you the flexibility to review your edits visually without firing up a heavy desktop application.",
        "steps": [
            "Open your clip in the visual editing interface.",
            "Use the timeline to adjust your segments.",
            "Preview your changes right in the browser.",
            "Export the finalized edit."
        ],
        "faqs": [
            {"q": "Is the editor entirely local?", "a": "Yes, despite having timeline controls, all editing logic runs in your browser via WebAssembly."},
            {"q": "Can I add multiple video tracks?", "a": "Currently, the editor focuses on single-track manipulation for quick, focused edits."}
        ],
        "tip": "Use the keyboard arrow keys to step through frames for more precise editing."
    },
    {
        "id": "add-image-to-video",
        "name": "Add Image to Video",
        "desc": "Branding your content with a custom logo or watermark keeps your intellectual property secure when distributed. This function overlays any image asset over your video stream. Using WebAssembly to composite the layers, it bakes the graphic permanently into the frames.",
        "steps": [
            "Upload your base video file.",
            "Upload the transparent PNG or JPG you wish to overlay.",
            "Position the image on the video canvas.",
            "Render and download the combined video."
        ],
        "faqs": [
            {"q": "Does the overlay image need to be transparent?", "a": "It doesn't have to be, but a transparent PNG works best for logos and watermarks."},
            {"q": "Can I animate the watermark?", "a": "This tool currently applies static images uniformly across the video's duration."}
        ],
        "tip": "Ensure your watermark isn't too large; placing it in the bottom corner is the industry standard."
    },
    {
        "id": "resize-video",
        "name": "Resize Video",
        "desc": "Changing the dimensions of your footage is crucial when adapting content for different platforms like Instagram stories or widescreen displays. Scaling the video alters its resolution width and height to fit your desired aspect ratio. The internal encoder smoothly interpolates the pixels for a crisp result.",
        "steps": [
            "Provide the video you need scaled.",
            "Enter the new width and height in pixels.",
            "Select whether to preserve the aspect ratio.",
            "Resize and save your clip."
        ],
        "faqs": [
            {"q": "Will resizing cause the video to look stretched?", "a": "Not if you check the 'preserve aspect ratio' option, which will add black bars if necessary instead of stretching."},
            {"q": "Can I upscale a low-res video?", "a": "Yes, but upscaling cannot add missing detail, so the result might look slightly blurry."}
        ],
        "tip": "For Instagram, target 1080x1920. For standard HD YouTube videos, use 1920x1080."
    },
    {
        "id": "screen-recorder",
        "name": "Screen Recorder",
        "desc": "Capturing your display for tutorials, software demonstrations, or bug reports is directly supported here. It hooks into the native screen capture API of your modern browser to record windows or entire desktops. You immediately get a WebM file ready for playback or further editing.",
        "steps": [
            "Click the record button to prompt your browser's sharing dialog.",
            "Choose a specific window, tab, or your entire screen.",
            "Perform your demonstration.",
            "Stop recording and download the generated file."
        ],
        "faqs": [
            {"q": "Does it record system audio?", "a": "Yes, on most modern browsers you can check a box in the sharing dialog to include system audio."},
            {"q": "Where is the recording saved before downloading?", "a": "It is stored temporarily in your browser's memory using Blob objects."}
        ],
        "tip": "Recording just a specific tab uses less processing power than recording a 4K desktop."
    },
    {
        "id": "add-text-to-video",
        "name": "Add Text to Video",
        "desc": "Inserting titles, captions, or contextual notes makes your videos much more informative. This feature burns text directly into the video frames, so it’s permanently visible regardless of the player. It is especially useful for creating quick social media clips with engaging headlines.",
        "steps": [
            "Drag in the video you want to annotate.",
            "Type your text and customize the font, size, and color.",
            "Position the text overlay on the preview.",
            "Render the video with the baked-in text."
        ],
        "faqs": [
            {"q": "Is the text accessible to screen readers?", "a": "No, because the text is 'burned' into the video pixels, it acts as an image. Use subtitles for accessibility."},
            {"q": "Can I add multiple lines of text?", "a": "Yes, you can use line breaks to create blocks of text."}
        ],
        "tip": "Use a contrasting stroke or drop shadow on your text so it remains readable against varying backgrounds."
    },
    {
        "id": "loop-video",
        "name": "Loop Video",
        "desc": "If you have a very short animation or clip that needs to run continuously in a presentation, multiplying it is an easy fix. The loop tool concatenates the same file back-to-back multiple times. You end up with a longer, self-repeating sequence in a single file.",
        "steps": [
            "Upload the short clip you want to repeat.",
            "Specify how many times it should loop.",
            "Process the file to append the copies.",
            "Download the extended video."
        ],
        "faqs": [
            {"q": "Is there a pause between loops?", "a": "No, the tool joins the end of the video perfectly to the beginning of the next iteration."},
            {"q": "Does looping increase the file size?", "a": "Yes, because the final file is physically longer and contains more data."}
        ],
        "tip": "Ensure the start and end frames of your clip look similar for a seamless, unnoticeable loop point."
    },
    {
        "id": "text-to-speech",
        "name": "Text to Speech",
        "desc": "Generating a voiceover from written scripts is an excellent way to narrate without a microphone. It utilizes the browser's built-in Web Speech API to synthesize spoken words and saves them as an audio track. You can then pair this generated dialogue with any visual content.",
        "steps": [
            "Paste your script into the text area.",
            "Select a voice profile and adjust the speaking rate.",
            "Preview the audio generation.",
            "Export the speech as an audio file."
        ],
        "faqs": [
            {"q": "Are the voices realistic?", "a": "The voices depend on the synthesis engine built into your specific browser and OS."},
            {"q": "Can I use this commercially?", "a": "Since it uses system voices, commercial rights depend on your operating system's terms of service."}
        ],
        "tip": "Use punctuation carefully; commas and periods add natural pauses to the generated speech."
    },
    {
        "id": "remove-logo-from-video",
        "name": "Remove Logo",
        "desc": "Sometimes you need to obscure a localized watermark or sensitive timestamp on your footage. The removal tool applies a targeted blur over the defined rectangular coordinate space. It’s a handy way to clean up visual distractions before repurposing stock or archival clips.",
        "steps": [
            "Upload the video containing the watermark.",
            "Draw a box over the logo in the preview area.",
            "Apply the blur filter.",
            "Save the clean video."
        ],
        "faqs": [
            {"q": "Does this completely recreate the pixels behind the logo?", "a": "No, it uses a blurring algorithm to interpolate surrounding pixels, obscuring the logo heavily."},
            {"q": "Can I remove a moving logo?", "a": "Currently, the tool applies a static rectangular blur across the entire duration of the clip."}
        ],
        "tip": "Make the bounding box as tight to the logo as possible to minimize the blurred area on your footage."
    },
    {
        "id": "change-video-volume",
        "name": "Change Volume",
        "desc": "When the dialogue is too quiet or the background music is overwhelmingly loud, adjusting the audio gain is necessary. This function scales the audio track's amplitude up or down based on your multiplier. It helps normalize the listening experience across different clips.",
        "steps": [
            "Select the video with the unbalanced audio.",
            "Set the percentage to increase or decrease the volume.",
            "Process the audio adjustments.",
            "Download the newly leveled video."
        ],
        "faqs": [
            {"q": "Will increasing volume cause distortion?", "a": "If you boost it too high beyond the digital ceiling, it will clip and distort. Increase it in small increments."},
            {"q": "Can I completely silence it here?", "a": "Yes, setting the volume to 0% works, though the Mute tool is faster for that specific task."}
        ],
        "tip": "Aim to increase volume only when the highest peaks in your audio aren't already hitting the maximum limit."
    },
    {
        "id": "merge-videos",
        "name": "Merge Videos",
        "desc": "Piecing together multiple recordings into a cohesive narrative doesn't require a timeline editor. The merge capability stitches several clips end-to-end into a single continuous file. As long as they share similar codecs, the concatenation happens seamlessly in the browser.",
        "steps": [
            "Select and upload multiple video files.",
            "Drag and drop to rearrange their playback order.",
            "Click merge to concatenate them.",
            "Export the combined video file."
        ],
        "faqs": [
            {"q": "Do all videos need to be the same resolution?", "a": "For the best results, yes. If they differ, the tool will attempt to scale them to match the first video."},
            {"q": "Is there a limit on how many videos I can merge?", "a": "The only limit is your browser's memory capacity. Sticking to 5-10 short clips works best."}
        ],
        "tip": "Ensure all clips are the same format (e.g., all MP4s) before merging to avoid encoding errors."
    },
    {
        "id": "crop-video",
        "name": "Crop Video",
        "desc": "Eliminating black bars or focusing on a specific subject in the frame is achieved by cropping. You define the exact X and Y coordinates and the new dimensions, and the tool trims the spatial edges. It effectively re-frames your composition without stretching the remaining pixels.",
        "steps": [
            "Load the video into the crop interface.",
            "Draw a bounding box to highlight the area to keep.",
            "Confirm the crop dimensions.",
            "Render and download the cropped video."
        ],
        "faqs": [
            {"q": "Does cropping reduce the resolution?", "a": "Yes, because you are physically removing pixels from the edges, the overall resolution of the output file will be smaller."},
            {"q": "Can I crop a landscape video into portrait?", "a": "Absolutely, just adjust the bounding box to a vertical aspect ratio like 9:16."}
        ],
        "tip": "Cropping is the best way to convert a widescreen YouTube video into a vertical format for TikTok or Shorts."
    },
    {
        "id": "change-video-speed",
        "name": "Change Speed",
        "desc": "Creating a time-lapse effect or a dramatic slow-motion sequence is straightforward by altering the playback rate. Speeding up or slowing down the video modifies the presentation timestamp of the frames. Note that this typically alters the audio pitch or drops the audio entirely depending on the rate.",
        "steps": [
            "Upload your clip.",
            "Select a speed multiplier (e.g., 0.5x for slow mo, 2x for fast forward).",
            "Process the speed alteration.",
            "Download the modified file."
        ],
        "faqs": [
            {"q": "Does slowing down a video make it choppy?", "a": "If your original video is 30fps and you slow it to 0.5x, it plays at 15fps, which may appear slightly choppy. 60fps footage is better for slow motion."},
            {"q": "What happens to the audio?", "a": "The audio will pitch down (sound deeper) when slowed, and pitch up (sound like a chipmunk) when sped up."}
        ],
        "tip": "If you don't want the distorted audio, it's often better to check the option to mute the video when changing speed."
    },
    {
        "id": "rotate-video",
        "name": "Rotate Video",
        "desc": "Fixing footage shot in the wrong orientation, like a sideways smartphone video, is a common chore. The rotation utility pivots the entire frame by 90 or 180 degrees. It physically rewrites the video stream so it plays back correctly on all standard media players.",
        "steps": [
            "Import the incorrectly oriented video.",
            "Click the rotation buttons to pivot it 90 degrees at a time.",
            "Save the changes.",
            "Download the corrected video."
        ],
        "faqs": [
            {"q": "Does rotating change the aspect ratio?", "a": "Yes, rotating a 1920x1080 landscape video by 90 degrees turns it into a 1080x1920 portrait video."},
            {"q": "Why does my video look fine on my phone but sideways here?", "a": "Smartphones sometimes use metadata to tell players to rotate the video. This tool permanently bakes that rotation into the pixels."}
        ],
        "tip": "If the video is upside down, rotate it 180 degrees to preserve its original aspect ratio."
    },
    {
        "id": "stabilize-video",
        "name": "Stabilize Video",
        "desc": "Shaky handheld camera work can be jarring to watch. The stabilization process analyzes frame-to-frame motion and applies counter-movements to smooth out the jitter. It usually crops in slightly on the edges to hide the motion compensation boundaries.",
        "steps": [
            "Upload the shaky footage.",
            "Allow the tool to analyze the motion vectors.",
            "Apply the stabilization filter.",
            "Download the smoothed video."
        ],
        "faqs": [
            {"q": "Why did my video get cropped after stabilizing?", "a": "To counteract camera shake, the software has to move the frame around. It crops the edges so you don't see black borders dancing around the frame."},
            {"q": "Does this work for extremely shaky footage?", "a": "It works best on micro-jitters. Wild, sweeping shaky camera movements might result in weird warping artifacts."}
        ],
        "tip": "Keep your stabilization expectations realistic; it improves handheld footage but can't replicate a gimbal."
    },
    {
        "id": "add-audio-to-video",
        "name": "Add Audio to Video",
        "desc": "Replacing a noisy background track with a clean musical score elevates the production value of your clip. This feature multiplexes a new audio file into your existing video container. It effectively swaps out the original sound for your chosen narration or soundtrack.",
        "steps": [
            "Provide the primary video file.",
            "Upload the MP3 or WAV file for the new soundtrack.",
            "Merge the two streams together.",
            "Download the complete multimedia file."
        ],
        "faqs": [
            {"q": "What if the audio is longer than the video?", "a": "The tool will typically truncate the audio stream to match the length of the video stream."},
            {"q": "Does this remove the original audio?", "a": "Yes, this tool is designed to replace the existing audio track entirely."}
        ],
        "tip": "If you want to keep the original audio and just add background music, use the Video Editor instead to mix tracks."
    },
    {
        "id": "flip-video",
        "name": "Flip Video",
        "desc": "Creating a mirror image of your clip is useful for stylistic effects or correcting reversed webcam recordings. Flipping horizontally reverses the left and right sides of the frame. It processes the pixel data across the entire video duration uniformly.",
        "steps": [
            "Load the video you want to mirror.",
            "Select whether to flip horizontally or vertically.",
            "Process the effect.",
            "Save the mirrored result."
        ],
        "faqs": [
            {"q": "Is flipping different from rotating?", "a": "Yes, rotating turns the image, while flipping mirrors it. Flipping text will make it appear backwards."},
            {"q": "Why would I flip vertically?", "a": "Vertical flipping is rarely used for standard correction, but it can create interesting abstract reflections for creative projects."}
        ],
        "tip": "Horizontal flipping is the perfect fix if your webcam recorded you with a mirrored perspective and you want to correct it."
    },
    {
        "id": "video-recorder",
        "name": "Video Recorder",
        "desc": "Filming a quick personal message or a vlog entry can be done without external software. The recorder accesses your connected webcam and microphone to capture live input. It instantly wraps the recorded stream into a downloadable file when you hit stop.",
        "steps": [
            "Grant browser permissions for camera and microphone access.",
            "Click record to start capturing.",
            "Click stop when finished.",
            "Download the captured WebM file."
        ],
        "faqs": [
            {"q": "What resolution does it record in?", "a": "It typically records in your webcam's native resolution, often 720p or 1080p."},
            {"q": "Can I record on my phone?", "a": "Yes, if you use a mobile browser that supports the MediaRecorder API, it will utilize your phone's front or back camera."}
        ],
        "tip": "Ensure you are in a well-lit room before recording, as browser-based recording lacks advanced exposure controls."
    }
]

html_content = ["<section class=\"tool-seo-content reveal\">\n  <h2>How to Use the Video Tools</h2>"]

for item in tools_data:
    uid = item["id"]
    name = item["name"]
    desc = item["desc"]
    steps = item["steps"]
    faqs = item["faqs"]
    tip = item["tip"]
    
    steps_html = "\\n".join([f"      <li>{s}</li>" for s in steps])
    faqs_html = "\\n".join([f"""    <details class="tool-faq">
      <summary>{faq['q']}</summary>
      <p>{faq['a']}</p>
    </details>""" for faq in faqs])
    
    html_content.append(f"""
  <article class="tool-guide" id="{uid}-guide">
    <h3>{name}</h3>
    <p>{desc}</p>
    <h4>How to use {name}:</h4>
    <ol>
{steps_html}
    </ol>
    <div class="tool-tip-box">
      <strong>Pro Tip:</strong> {tip}
    </div>
{faqs_html}
  </article>
""")

html_content.append("</section>")

with open("c:\\Users\\dkuba\\Downloads\\draft-and-merge-multipage\\seo_content.html", "w", encoding="utf-8") as f:
    f.write("\\n".join(html_content))
