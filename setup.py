"""py2app build config — produces GitKosh.app.

Build:  .venv-app/bin/python setup.py py2app
The modern web UI (pywebview + webui/) is the default surface; the legacy
Tkinter panel ships as a fallback. The native WebKit login window runs in a
relaunched 'login' role.
"""
from setuptools import setup

from app.constants import VERSION

APP = ["app_main.py"]

DATA_FILES = [("webui", [
    "webui/index.html", "webui/app.js", "webui/style.css", "webui/sample-card.png",
])]

OPTIONS = {
    "argv_emulation": False,
    "iconfile": "dist_icon/AppIcon.icns",
    "packages": [
        "gitkosh", "app",
        "webview", "PIL",
        "requests", "urllib3", "idna", "certifi", "charset_normalizer",
        "bs4", "soupsieve", "html2text", "yaml",
    ],
    # PyObjC frameworks used by the web/login WebKit windows; proxy_tools &
    # typing_extensions are pywebview runtime deps.
    "includes": ["objc", "Foundation", "Cocoa", "WebKit", "tkinter",
                 "proxy_tools", "typing_extensions"],
    "plist": {
        "CFBundleName": "GitKosh",
        "CFBundleDisplayName": "GitKosh",
        "CFBundleIdentifier": "com.harshbajpai.gitkosh",
        "CFBundleShortVersionString": VERSION,
        "CFBundleVersion": VERSION,
        "LSMinimumSystemVersion": "12.0",
        "NSHighResolutionCapable": True,
        # The app opens external login pages; no special entitlements needed unsigned.
    },
}

setup(
    app=APP,
    name="GitKosh",
    data_files=DATA_FILES,
    options={"py2app": OPTIONS},
    setup_requires=["py2app"],
)
