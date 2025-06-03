import os
import time
import logging
from datetime import datetime, timedelta
import schedule
from threading import Thread
from app.config import FILES_GENERATED_DIR, FILES_CONVERTED_DIR

logger = logging.getLogger(__name__)
logger.propagate = True

def empty_folders(folder_paths, max_age_in_hours):
	"""
	Removes all files older than the specified age from the provided folders.

	Args:
			folder_paths (list): List of folder paths to clean.
			max_age_in_hours (int): Maximum retention time in hours.
	"""
	now = datetime.now()
	for folder_path in folder_paths:
		try:
			if not os.path.exists(folder_path):
				logger.warning(f"Folder does not exist: {folder_path}")
				continue

			for filename in os.listdir(folder_path):
				file_path = os.path.join(folder_path, filename)
				if os.path.isfile(file_path):
					file_age = now - datetime.fromtimestamp(os.path.getmtime(file_path))

					if file_age > timedelta(hours=max_age_in_hours):
						os.remove(file_path)
						logger.info(f"Deleted file: {file_path}")
		except Exception as e:
			logger.error(f"Error while emptying folder {folder_path}: {e}")

def cleanup_files():
	"""
	Cleans up files in specified folders while keeping the folders intact.
	"""
	
	folder_paths = [
		FILES_GENERATED_DIR,
		FILES_CONVERTED_DIR
	]
	
	max_age_in_hours = 24 
	logger.info(f"Starting cleanup for folders: {folder_paths}")
	empty_folders(folder_paths, max_age_in_hours)
	logger.info("Cleanup completed for all folders.")

def start_cleanup_schedule():
	"""
	Schedules the automatic folder cleanup every hour.
	"""
	schedule.every().hour.do(cleanup_files)

	def run_schedule():
		while True:
			schedule.run_pending()
			time.sleep(60) 

	cleanup_thread = Thread(target=run_schedule, daemon=True)
	cleanup_thread.start()
	logger.info("Scheduled cleanup task started.")