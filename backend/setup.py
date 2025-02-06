from setuptools import setup, find_packages

with open('requirements.txt') as f:
  required_packages = f.read().splitlines()

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
  name = "gc-ai-backend", 
  version = "1.0.0",       
  description = "Backend for GC-AI: Symbol Detection and SBOL3 File Generation",
  long_description=long_description,
  long_description_content_type="text/markdown",
  author = "Fernanda Lorca, Catalina Lorca",
  packages = find_packages(exclude=["frontend", "docs"]),
  include_package_data = True,
  install_requires = required_packages,
  entry_points = {
    "console_scripts": [
      "gc-ai-backend=run:main",
    ],
  },
  classifiers = [
    "Programming Language :: Python :: 3.9",
    "Operating System :: OS Independent",
  ],
  python_requires = ">=3.8",
)
