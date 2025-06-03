import os
import torch
import yaml
import mysql.connector
from mysql.connector import Error
from app.models.create_fasterrcnn_model import create_model
from app.utils.custom_error import CustomError
from dotenv import load_dotenv

load_dotenv()

BASE_PATH = os.path.dirname(os.path.abspath(__file__))  

FILES_CONVERTED_DIR = os.path.join(BASE_PATH, 'files_converted')
FILES_GENERATED_DIR = os.path.join(BASE_PATH, 'files_generated')
MODEL_PATH = os.path.join(BASE_PATH, 'models', 'model_files', '160_model.pth')
GLYPHS_CONFIG_PATH = os.path.join(BASE_PATH, 'data_configs', 'glyphs.yaml')

try:
	with open(GLYPHS_CONFIG_PATH, 'r') as file:
		data_configs = yaml.safe_load(file)
except FileNotFoundError:
    raise RuntimeError(f"Configuration file not found: {GLYPHS_CONFIG_PATH}")
except yaml.YAMLError as e:
    raise RuntimeError(f"Error parsing YAML file: {e}")

NUM_CLASSES = data_configs.get('NC', 0)
CLASSES = data_configs.get('CLASSES', [])
THRESHOLD = 0.7
DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

DB_CONFIG = {
	'host': os.getenv('DB_HOST'),
	'user': os.getenv('DB_USER'),
	'password': os.getenv('DB_PASSWORD'),
	'database': os.getenv('DB_NAME'),
	'port': int(os.getenv('DB_PORT')),
	'raise_on_warnings': True
}

def load_model():
  """
  Loads and initializes the ML model using the checkpoint from the specified MODEL_PATH.
  """
  try:
    # checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
    build_model = create_model[checkpoint['model_name']]
    model = build_model(num_classes=NUM_CLASSES, coco_model=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    return model.to(DEVICE).eval()
  except Exception as e:
    raise CustomError(f"Error loading the model: {e}", 500)

def get_db_connection():
	"""Establece una conexión a la base de datos y la devuelve."""
	try:
		connection = mysql.connector.connect(**DB_CONFIG)
		return connection
	except Error as e:
		raise RuntimeError(f"Database connection failed: {e}")

model = load_model()