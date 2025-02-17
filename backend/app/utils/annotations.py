import numpy as np
import cv2

def inference_annotations(outputs, classes, colors, orig_image):
	"""
	Draws annotations on the original image based on filtered predictions.

	Args:
		outputs: Dictionary containing filtered 'boxes', 'scores', and 'labels' from predictions.
		classes: List of class names corresponding to labels.
		colors: List of colors corresponding to class names for annotations.
		orig_image: The original image on which annotations will be drawn.

	Returns:
		orig_image: The original image with annotations drawn.
		draw_boxes: Bounding boxes used for drawing annotations.
		pred_classes: List of predicted class names corresponding to the bounding boxes.
	"""
 
	boxes = np.array(outputs['boxes'])
	labels = outputs['labels']

	draw_boxes = boxes.astype(np.int32)
	pred_classes = [classes[i] for i in labels]

	lw = max(round(sum(orig_image.shape) / 2 * 0.003), 2) 
	tf = max(lw - 1, 1) 

	for j, box in enumerate(draw_boxes):
		p1, p2 = (int(box[0]), int(box[1])), (int(box[2]), int(box[3]))
		class_name = pred_classes[j]
		#color = colors[classes.index(class_name)]
		color = colors[labels[j]]

		cv2.rectangle(orig_image, p1, p2, color=color, thickness=lw, lineType=cv2.LINE_AA)

		w, h = cv2.getTextSize(class_name, 0, fontScale=lw / 3, thickness=tf)[0]
		outside = p1[1] - h >= 3
		p2 = p1[0] + w, p1[1] - h - 3 if outside else p1[1] + h + 3
		cv2.rectangle(orig_image, p1, p2, color=color, thickness=-1, lineType=cv2.LINE_AA)
		cv2.putText(
			orig_image,
			class_name,
			(p1[0], p1[1] - 5 if outside else p1[1] + h + 2),
			cv2.FONT_HERSHEY_SIMPLEX,
			fontScale=lw / 3.8,
			color=(255, 255, 255),
			thickness=tf,
			lineType=cv2.LINE_AA,
		)

	return orig_image, draw_boxes, pred_classes
