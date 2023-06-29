
<div dir="rtl">

# پروژه شبکه های کامپیوتری

سجاد کیانی مقدم

هدیه غلامپور

۸ تیر ۱۴۰۱



##  فهرست مطالب
۱. [مقدمه](#مقدمه)

۲. [احراز هویت](#احراز-هویت)

۳. [دریافت لیست فایل ها](#دریافت-لیست-فایل-ها)

۴. [ارسال فایل](#ارسال-فایل)

۵. [دریافت فایل](#دریافت-فایل)



## مقدمه

‍FTP (File Transfer Protocol) یک پروتکل استاندارد است که برای انتقال فایل ها بین یک کلاینت و یک سرور از طریق یک شبکه مانند اینترنت استفاده می شود. در این پروژه، نحوه اجرای مدیریت فایلFTP با استفاده از جاوا اسکریپت و WebSocket را بررسی خواهیم کرد.


## سرور FTP

برای ایجاد یک اتصال ftp: ابتدا باید یک اتصال به socket سرور ایجاد کنیم. برای برای این کار باید از کتابخانه Websocket در جاوا اسکریپت استفاده کرد. به این صورت که یک شی  جدید ایجاد کنیم و آدرس سرور  و شماره پورت را ارسال کنیم:

<div dir="ltr">

```javascript
import {WebSocketServer} from 'ws';

// Create a new WebSocket server
const wss = new WebSocketServer({ port: 8080 });
```
</div>

### احراز هویت

هنگامی که اتصال WebSocket را برقرار کردیم، باید به سرور FTP احراز هویت کنیم. این کار را می توان با استفاده از پیام `auth:username:password` انجام داد. ما می توانیم این دستورات را از طریق اتصال WebSocket با استفاده از روش send() ارسال کنیم. برای این کار باید یک شی جدید از کلاس Client ایجاد کنیم و آن را به عنوان پارامتر به تابع handle() بفرستیم. این تابع برای پردازش دستورات ارسالی از طرف کلاینت استفاده می شود. در این تابع ابتدا دستور ارسالی را از طرف کلاینت بررسی می کنیم. اگر دستور USER بود، اسم کاربری را در متغیر username ذخیره می کنیم. اگر دستور PASS بود، اگر اسم کاربری قبلا ذخیره شده بود، این دستور را به سرور ارسال می کنیم. در غیر این صورت، یک پیام خطا به کلاینت ارسال می کنیم. اگر دستور USER یا PASS نبود، یک پیام خطا به کلاینت ارسال می کنیم.

پیغام دریافت شده از طرف کلاینت:

<div dir="ltr">


```js
const data = message.toString();
    // if (!data instanceof Buffer) {
    console.log('Received message:', data);
    // }

    if (data.startsWith('auth')) {
      const username = data.split(':')[1];
      const password = data.split(':')[2];

      const isAuth = authenticateUser(username, password);

      if (isAuth) {
        ws.isAuth = true;
        ws.username = username;
        ws.send('authenticated');
      } else {
        ws.send('authenticationFailed');
      }
    }
```

 </div>

### دریافت لیست فایل ها

پس از اتصال کلاینت به سرور و احراز هویت بلافاصله پیغام  `list` را برای سرور ارسال می کند. و سرور لیست فایل هایی که در دایرکتوری `./files` وجود دارد را برای کاربر به صورت آرایه ارسال می کند.

<div dir="ltr">

```js
if (ws.isAuth && data.startsWith('list')) {
    
}
```

</div>

### ارسال فایل

برای ارسال فایل پس از تایید احراز هویت، کاربر پیغامی به صورت `download:{filename}` ارسال می کند که در آن filename اسم فایلی است که می خواهد آن را دریافت کند. سپس سرور فایل مورد نظر را به صورت Binary با استفاده از Buffer ارسال می کند

<div dir="ltr">

```js
if (ws.isAuth && data.startsWith('download') ) {
  const fileName = data.split(':')[1];
  const filePath = `files/${fileName}`;

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Read the file as binary data
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      
      // Send the file as binary data over WebSocket
      ws.send(data, { binary: true }, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        } else {
          console.log('File sent successfully');
          ws.send('downloadComplete')
        }
      });
    });
  } else {
    ws.send('File not found');
  }
}
```

</div>

### دریافت فایل

برای آپلود فایل ها در سرور FTP می توانیم از دستور `upload:{filename}` استفاده کنیم. می‌توانیم این دستور را به همراه نام فایلی که می‌خواهیم آپلود کنیم و محتوای فایل را از طریق اتصال WebSocket ارسال کنیم. و سپس کاربر فایل را به صورت Binary با استفاده از Buffer ارسال می کند. سرور با پیغام موفقیت یا خطا پاسخ خواهد داد.

<div dir="ltr">

```js
if (ws.isAuth && data.startsWith('upload')) {
    const fileName = data.split(':')[1];

    // get file content from the client
    ws.on('message', (message) => {
        // if message is instance of Buffer, then it is a file
        if (message instanceof Buffer) {
            // write file to the server
            fs.writeFile(`files/${fileName}`, message, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    return;
                }
                console.log('File saved successfully');
                ws.send('uploadComplete');
            });
        }
    })
}
```

</div>

</div>
