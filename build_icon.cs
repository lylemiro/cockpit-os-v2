using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace IconGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            int[] sizes = new int[] { 256, 128, 64, 48, 32, 16 };
            List<byte[]> pngBytesList = new List<byte[]>();

            foreach (int size in sizes)
            {
                using (Bitmap bmp = RenderSvgGeometry(size))
                {
                    using (MemoryStream ms = new MemoryStream())
                    {
                        bmp.Save(ms, ImageFormat.Png);
                        pngBytesList.Add(ms.ToArray());
                    }
                }
            }

            // Write Windows .ICO file with all resolutions
            using (FileStream fs = new FileStream("app.ico", FileMode.Create))
            using (BinaryWriter bw = new BinaryWriter(fs))
            {
                // ICONDIR header
                bw.Write((ushort)0); // reserved
                bw.Write((ushort)1); // type 1 = ICO
                bw.Write((ushort)pngBytesList.Count); // image count

                int offset = 6 + (16 * pngBytesList.Count);

                for (int i = 0; i < pngBytesList.Count; i++)
                {
                    int s = sizes[i];
                    byte[] data = pngBytesList[i];

                    bw.Write((byte)(s >= 256 ? 0 : s)); // Width (0 means 256)
                    bw.Write((byte)(s >= 256 ? 0 : s)); // Height (0 means 256)
                    bw.Write((byte)0); // Color count
                    bw.Write((byte)0); // Reserved
                    bw.Write((ushort)1); // Color planes
                    bw.Write((ushort)32); // Bits per pixel
                    bw.Write((uint)data.Length); // Image size in bytes
                    bw.Write((uint)offset); // File offset of image data

                    offset += data.Length;
                }

                // Write PNG payload for each icon resolution
                for (int i = 0; i < pngBytesList.Count; i++)
                {
                    bw.Write(pngBytesList[i]);
                }
            }

            Console.WriteLine("Successfully created app.ico with 6 resolutions (16px to 256px)!");
        }

        static Bitmap RenderSvgGeometry(int size)
        {
            Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);

                float scale = size / 64f;

                // 1. Background Rounded Rect with Linear Gradient (#093821 -> #051B10)
                float rectX = 2 * scale;
                float rectY = 2 * scale;
                float rectW = 60 * scale;
                float rectH = 60 * scale;
                float radius = 15 * scale;

                using (GraphicsPath bgPath = CreateRoundedRectanglePath(rectX, rectY, rectW, rectH, radius))
                {
                    using (LinearGradientBrush bgBrush = new LinearGradientBrush(
                        new PointF(0, 0),
                        new PointF(size, size),
                        Color.FromArgb(255, 9, 56, 33),
                        Color.FromArgb(255, 5, 27, 16)))
                    {
                        g.FillPath(bgBrush, bgPath);
                    }

                    // Stroke (#10B981, 45% opacity)
                    using (Pen bgPen = new Pen(Color.FromArgb(115, 16, 185, 129), 1.5f * scale))
                    {
                        g.DrawPath(bgPen, bgPath);
                    }
                }

                // Helper to scale PointF
                Func<float, float, PointF> P = (x, y) => new PointF(x * scale, y * scale);

                // 2. Polygon 1: Left Upper Facet (10,31 32,14 32,27 15,37)
                // Gradient #F6C854 -> #C88A14
                PointF[] p1 = new PointF[] { P(10, 31), P(32, 14), P(32, 27), P(15, 37) };
                using (LinearGradientBrush b1 = new LinearGradientBrush(
                    P(10, 14), P(32, 38),
                    Color.FromArgb(255, 246, 200, 84),
                    Color.FromArgb(255, 200, 138, 20)))
                {
                    g.FillPolygon(b1, p1);
                }

                // 3. Polygon 2: Left Lower Facet (10,31 15,37 32,27 32,35 10,49)
                // Gradient #B6780C -> #8A5705
                PointF[] p2 = new PointF[] { P(10, 31), P(15, 37), P(32, 27), P(32, 35), P(10, 49) };
                using (LinearGradientBrush b2 = new LinearGradientBrush(
                    P(10, 30), P(32, 50),
                    Color.FromArgb(255, 182, 120, 12),
                    Color.FromArgb(255, 138, 87, 5)))
                {
                    g.FillPolygon(b2, p2);
                }

                // 4. Polygon 3: Right Upper Facet (32,14 55,29 45,35 32,26)
                // Gradient #6EE7B7 -> #10B981
                PointF[] p3 = new PointF[] { P(32, 14), P(55, 29), P(45, 35), P(32, 26) };
                using (LinearGradientBrush b3 = new LinearGradientBrush(
                    P(32, 14), P(55, 30),
                    Color.FromArgb(255, 110, 231, 183),
                    Color.FromArgb(255, 16, 185, 129)))
                {
                    g.FillPolygon(b3, p3);
                }

                // 5. Polygon 4: Right Lower Beak Tip Facet (32,26 52,40 32,35)
                // Gradient #10B981 -> #057A44
                PointF[] p4 = new PointF[] { P(32, 26), P(52, 40), P(32, 35) };
                using (LinearGradientBrush b4 = new LinearGradientBrush(
                    P(32, 26), P(52, 40),
                    Color.FromArgb(255, 16, 185, 129),
                    Color.FromArgb(255, 5, 122, 68)))
                {
                    g.FillPolygon(b4, p4);
                }
            }
            return bmp;
        }

        static GraphicsPath CreateRoundedRectanglePath(float x, float y, float width, float height, float radius)
        {
            GraphicsPath path = new GraphicsPath();
            float d = radius * 2;
            path.AddArc(x, y, d, d, 180, 90);
            path.AddArc(x + width - d, y, d, d, 270, 90);
            path.AddArc(x + width - d, y + height - d, d, d, 0, 90);
            path.AddArc(x, y + height - d, d, d, 90, 90);
            path.CloseFigure();
            return path;
        }
    }
}

