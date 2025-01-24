setInterval(async () => {
    inputtext.style.width = video1.offsetWidth.toString() + "px";
    inputtext.style.height = video1.offsetHeight.toString() / 8 + "px";
    inputtextUser.style.width = video1.offsetWidth.toString() + "px";
    inputtextUser.style.height = video1.offsetHeight.toString() / 8 + "px";
    displaySize = { width: video1.offsetWidth, height: video1.offsetHeight };
    faceapi.matchDimensions(canvas, displaySize);

    // 年紀性別偵測
    const detections = await faceapi
        .detectAllFaces(video1, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    start = new Date().getTime();

    if (resizedDetections.length >= 1) {
        const age = resizedDetections[0]["age"]; // 年紀
        const gender = resizedDetections[0]["gender"]; // 性別

        if (start - end >= 5000) { // 確保至少 5 秒後才執行
            console.log("send to adafruit");

            $.ajax({
                url:
                    "https://io.adafruit.com/api/v2/" +
                    inputtextUser.value +
                    "/feeds/age/data?X-AIO-Key=" +
                    inputtext.value,
                type: "POST",
                data: {
                    value: parseInt(age),
                },
            });

            end = start;
        }
    }

    mask.style.display = "none";
    loadImg.style.display = "none";
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    resizedDetections.forEach((detection) => {
        const { age, gender, genderProbability } = detection;
        new faceapi.draw.DrawTextField(
            [`${parseInt(age, 10)} years`, `${gender} (${parseInt(genderProbability * 100, 10)})`],
            detection.detection.box.topRight
        ).draw(canvas);
    });

    checkCookie();
}, 2000); // 每 5000 毫秒（5 秒）執行一次
