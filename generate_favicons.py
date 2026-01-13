from PIL import Image
import os
import sys

try:
    base_path = "img/favicon-base.png"
    if not os.path.exists(base_path):
        print(f"Base image not found at {base_path}")
        sys.exit(1)

    img = Image.open(base_path)

    # favicon.ico in root
    img.save("favicon.ico", format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("Generated favicon.ico in root")

    # others in img folder
    img.resize((16, 16), Image.Resampling.LANCZOS).save("img/favicon-16x16.png")
    print("Generated img/favicon-16x16.png")

    img.resize((32, 32), Image.Resampling.LANCZOS).save("img/favicon-32x32.png")
    print("Generated img/favicon-32x32.png")

    img.resize((180, 180), Image.Resampling.LANCZOS).save("img/apple-touch-icon.png")
    print("Generated img/apple-touch-icon.png")

except ImportError:
    print("Pillow not installed. Please install it.")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
