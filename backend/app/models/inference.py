import numpy as np
import cv2
import torch
from app.utils.annotations import inference_annotations
from torchvision import transforms as transforms
from app.config import THRESHOLD, CLASSES, DEVICE

#python3 inference.py --weights best_model.pth --input test_data --threshold 0.9

COLOR_MAP = {
    '__background__': (255, 255, 255),  
    'aptamer': (255, 189, 98),  
    'cds': (223, 103, 160),  
    'cds-arrow': (150, 193, 85),  
    'engineered-region': (16, 137, 214),  
    'inert-dna-spacer': (101, 173, 229), 
    'ncrna': (213, 108, 178), 
    'operator': (226, 173, 77), 
    'origin-of-replication': (108, 144, 179),  
    'origin-of-transfer': (179, 196, 255), 
    'polyA': (224, 162, 239),  
    'primer-binding-site': (120, 193, 130), 
    'promoter': (99, 180, 40), 
    'ribosome-entry-site': (255, 163, 102),  
    'terminator': (94, 99, 255),
}

def infer_transforms(image):
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.ToTensor(),
    ])
    return transform(image)

def calculate_iou(box1, box2):
    """
    Calculates the Intersection over Union (IoU) between two bounding boxes.

    Args:
        box1: Coordinates of the first box as [x_min, y_min, x_max, y_max].
        box2: Coordinates of the second box as [x_min, y_min, x_max, y_max].

    Returns:
        The IoU value, a float between 0 and 1, indicating the overlap ratio.
        Returns 0 if there is no overlap.
    """
    
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])


    intersection = max(0, x2 - x1) * max(0, y2 - y1)

    area_box1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area_box2 = (box2[2] - box2[0]) * (box2[3] - box2[1])

    union = area_box1 + area_box2 - intersection

    return intersection / union if union > 0 else 0

def filter_predictions_with_highest_score(outputs, detection_threshold, iou_threshold=0.3):
    """
    Filters predictions to retain only one per overlapping area based on the highest score.

    Args:
        outputs: Model outputs containing 'boxes', 'scores', and 'labels'.
        detection_threshold: Minimum detection threshold to retain predictions.
        iou_threshold: IoU threshold to consider two boxes as overlapping.

    Returns:
        boxes: Selected bounding boxes.
        scores: Corresponding scores of the selected boxes.
        labels: Corresponding labels of the selected boxes.
    """
    boxes = outputs[0]['boxes'].data.numpy()
    scores = outputs[0]['scores'].data.numpy()
    labels = outputs[0]['labels'].cpu().numpy()

    valid_indices = scores >= detection_threshold
    boxes = boxes[valid_indices]
    scores = scores[valid_indices]
    labels = labels[valid_indices]

    if len(boxes) == 0:
        return [], [], []

    sorted_indices = np.argsort(-scores)
    boxes = boxes[sorted_indices]
    scores = scores[sorted_indices]
    labels = labels[sorted_indices]

    selected_indices = []
    for i in range(len(boxes)):
        keep = True
        for j in selected_indices:
            if calculate_iou(boxes[i], boxes[j]) > iou_threshold:
                keep = False
                break
        if keep:
            selected_indices.append(i)

    boxes = boxes[selected_indices]
    scores = scores[selected_indices]
    labels = labels[selected_indices]

    return boxes, scores, labels


def process_image(image_input, model):
    """
    Processes an input image to perform inference and returns filtered results.

    Args:
        image_input: The raw binary data of the input image.
        model: The pre-trained machine learning model used for inference.

    Returns:
        A tuple containing:
            - The annotated image with bounding boxes and labels.
            - A list of bounding box coordinates (if any).
            - A list of predicted class names corresponding to the bounding boxes.
    """
    nparr = np.frombuffer(image_input, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    orig_image = image.copy()
    image = cv2.cvtColor(orig_image, cv2.COLOR_BGR2RGB)
    image = infer_transforms(image)
    image = torch.unsqueeze(image, 0)

    with torch.no_grad():
        outputs = model(image.to(DEVICE))

    outputs = [{k: v.to('cpu') for k, v in t.items()} for t in outputs]

    COLORS = [COLOR_MAP[label] for label in CLASSES]

    if len(outputs[0]['boxes']) != 0:
        boxes, scores, labels = filter_predictions_with_highest_score(outputs, THRESHOLD)
        orig_image, draw_boxes, pred_classes = inference_annotations({'boxes': boxes, 'scores': scores, 'labels': labels}, CLASSES, COLORS, orig_image)
        return orig_image, draw_boxes, pred_classes

    return orig_image, [], []