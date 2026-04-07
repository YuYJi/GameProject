"""记忆工具"""

from typing import Dict, Any, Optional
import json
import pickle
import h5py
import numpy as np


def serialize_memory(memory: Dict[str, Any], format: str = 'json') -> bytes:
    """序列化记忆

    Args:
        memory: 记忆对象
        format: 序列化格式，支持 'json', 'pickle', 'hdf5'

    Returns:
        序列化后的字节
    """
    if format == 'json':
        return json.dumps(memory, default=_json_serializer).encode('utf-8')
    elif format == 'pickle':
        return pickle.dumps(memory)
    elif format == 'hdf5':
        return _serialize_to_hdf5(memory)
    else:
        raise ValueError(f"Unsupported format: {format}")


def deserialize_memory(data: bytes, format: str = 'json') -> Dict[str, Any]:
    """反序列化记忆

    Args:
        data: 序列化的字节
        format: 序列化格式，支持 'json', 'pickle', 'hdf5'

    Returns:
        反序列化后的记忆对象
    """
    if format == 'json':
        return json.loads(data.decode('utf-8'), object_hook=_json_deserializer)
    elif format == 'pickle':
        return pickle.loads(data)
    elif format == 'hdf5':
        return _deserialize_from_hdf5(data)
    else:
        raise ValueError(f"Unsupported format: {format}")


def _json_serializer(obj: Any) -> Any:
    """JSON序列化器

    Args:
        obj: 要序列化的对象

    Returns:
        可序列化的对象
    """
    if isinstance(obj, np.ndarray):
        return {
            '__ndarray__': True,
            'dtype': str(obj.dtype),
            'shape': obj.shape,
            'data': obj.tolist()
        }
    elif isinstance(obj, (np.int64, np.int32, np.float64, np.float32)):
        return float(obj)
    else:
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def _json_deserializer(obj: Dict[str, Any]) -> Any:
    """JSON反序列化器

    Args:
        obj: 要反序列化的对象

    Returns:
        反序列化后的对象
    """
    if '__ndarray__' in obj:
        dtype = np.dtype(obj['dtype'])
        shape = tuple(obj['shape'])
        data = obj['data']
        return np.array(data, dtype=dtype).reshape(shape)
    else:
        return obj


def _serialize_to_hdf5(memory: Dict[str, Any]) -> bytes:
    """序列化到HDF5格式

    Args:
        memory: 记忆对象

    Returns:
        序列化后的字节
    """
    import io
    buffer = io.BytesIO()
    with h5py.File(buffer, 'w') as f:
        _write_dict_to_hdf5(f, memory, '/')
    return buffer.getvalue()


def _deserialize_from_hdf5(data: bytes) -> Dict[str, Any]:
    """从HDF5格式反序列化

    Args:
        data: 序列化的字节

    Returns:
        反序列化后的记忆对象
    """
    import io
    buffer = io.BytesIO(data)
    with h5py.File(buffer, 'r') as f:
        return _read_dict_from_hdf5(f, '/')


def _write_dict_to_hdf5(f: h5py.File, data: Dict[str, Any], path: str):
    """将字典写入HDF5文件

    Args:
        f: HDF5文件对象
        data: 字典数据
        path: 路径
    """
    for key, value in data.items():
        current_path = f"{path}{key}"
        if isinstance(value, dict):
            f.create_group(current_path)
            _write_dict_to_hdf5(f, value, f"{current_path}/")
        elif isinstance(value, np.ndarray):
            f.create_dataset(current_path, data=value)
        elif isinstance(value, (int, float, str, bool)):
            f.create_dataset(current_path, data=value)
        elif isinstance(value, list):
            # 处理列表
            if all(isinstance(item, (int, float, str, bool)) for item in value):
                f.create_dataset(current_path, data=value)
            else:
                # 复杂列表，转换为字符串
                f.create_dataset(current_path, data=str(value))
        else:
            # 其他类型，转换为字符串
            f.create_dataset(current_path, data=str(value))


def _read_dict_from_hdf5(f: h5py.File, path: str) -> Dict[str, Any]:
    """从HDF5文件读取字典

    Args:
        f: HDF5文件对象
        path: 路径

    Returns:
        读取的字典
    """
    result = {}
    for key in f[path].keys():
        current_path = f"{path}{key}"
        if isinstance(f[current_path], h5py.Group):
            result[key] = _read_dict_from_hdf5(f, f"{current_path}/")
        else:
            try:
                # 尝试读取为数组
                data = f[current_path][()]
                # 如果是标量，转换为Python类型
                if np.isscalar(data):
                    data = data.item()
                result[key] = data
            except Exception:
                # 读取失败，转换为字符串
                result[key] = str(f[current_path][()])
    return result


def compress_memory(memory: Dict[str, Any], compression_level: int = 5) -> bytes:
    """压缩记忆

    Args:
        memory: 记忆对象
        compression_level: 压缩级别（0-9）

    Returns:
        压缩后的字节
    """
    import zlib
    serialized = serialize_memory(memory)
    return zlib.compress(serialized, compression_level)


def decompress_memory(data: bytes) -> Dict[str, Any]:
    """解压缩记忆

    Args:
        data: 压缩的字节

    Returns:
        解压缩后的记忆对象
    """
    import zlib
    decompressed = zlib.decompress(data)
    return deserialize_memory(decompressed)


def validate_memory(memory: Dict[str, Any]) -> bool:
    """验证记忆对象

    Args:
        memory: 记忆对象

    Returns:
        是否有效
    """
    required_fields = ['id', 'content', 'timestamp']
    for field in required_fields:
        if field not in memory:
            return False
    return True


def sanitize_memory(memory: Dict[str, Any]) -> Dict[str, Any]:
    """清理记忆对象

    Args:
        memory: 记忆对象

    Returns:
        清理后的记忆对象
    """
    sanitized = {}
    for key, value in memory.items():
        if isinstance(value, (int, float, str, bool, type(None))):
            sanitized[key] = value
        elif isinstance(value, np.ndarray):
            # 限制数组大小
            if value.size > 10000:
                sanitized[key] = value[:10000].tolist()
            else:
                sanitized[key] = value.tolist()
        elif isinstance(value, list):
            # 限制列表长度
            if len(value) > 1000:
                sanitized[key] = value[:1000]
            else:
                sanitized[key] = value
        elif isinstance(value, dict):
            sanitized[key] = sanitize_memory(value)
        else:
            # 其他类型，转换为字符串
            sanitized[key] = str(value)
    return sanitized