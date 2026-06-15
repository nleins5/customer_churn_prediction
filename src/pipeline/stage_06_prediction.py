from src.config.configuration import ConfigurationManager
from src.components.prediction import PredictionPipeline
from src.utils.logger import logger


STAGE_NAME = "Giai đoạn Prediction & Submission"


class PredictionTrainingPipeline:
    def __init__(self):
        pass

    def main(self):
        """
        Chạy prediction pipeline để tạo file submission.csv
        """
        try:
            logger.info("Initializing Prediction Pipeline...")
            
            # Khởi tạo ConfigurationManager để lấy config
            config = ConfigurationManager()
            prediction_config = config.get_prediction_config()
            
            # Khởi tạo PredictionPipeline với config
            predictor = PredictionPipeline(config=prediction_config)
            
            # Chạy prediction pipeline
            predictor.run()
            
            logger.info("✅ Submission file created successfully")
            
        except Exception as e:
            logger.exception(f"Error in Prediction Pipeline: {e}")
            raise e


if __name__ == '__main__':
    try:
        logger.info(f">>>>>> Bắt đầu giai đoạn {STAGE_NAME} <<<<<<")
        obj = PredictionTrainingPipeline()
        obj.main()
        logger.info(f">>>>>> Hoàn thành giai đoạn {STAGE_NAME} <<<<<<\n\nx==========x")
    except Exception as e:
        logger.exception(e)
        raise e
