from src.config.configuration import ConfigurationManager
from src.components.data_transformation import DataTransformation
from src.utils.logger import logger

STAGE_NAME = "Giai đoạn Data Transformation"


class DataTransformationTrainingPipeline:
    """
    Pipeline thực thi giai đoạn Data Transformation.
    """

    def __init__(self):
        """Khởi tạo pipeline cho Data Transformation."""
        pass

    def main(self):
        """
        Luồng chạy chính của Data Transformation.
        """
        try:
            config = ConfigurationManager()
            data_transformation_config = config.get_data_transformation_config()
            data_transformation = DataTransformation(config=data_transformation_config)
            data_transformation.initiate_data_transformation()
        except Exception as e:
            raise e


if __name__ == '__main__':
    try:
        logger.info(f">>>>>> Bắt đầu giai đoạn {STAGE_NAME} <<<<<<")
        obj = DataTransformationTrainingPipeline()
        obj.main()
        logger.info(f">>>>>> Hoàn thành giai đoạn {STAGE_NAME} <<<<<<\n\nx==========x")
    except Exception as e:
        logger.exception(e)
        raise e